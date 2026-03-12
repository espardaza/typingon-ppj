import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  // ==========================================
  // 1. SIGN UP
  // ==========================================
  async signUp(dto: SignUpDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 160 * 1000); // 2 phút 40 giây

    let userToEmail: User; // <--- 2. KHAI BÁO RÕ RÀNG KIỂU DỮ LIỆU Ở ĐÂY

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new BadRequestException(
          'Email or Username already exists and is verified!',
        );
      } else {
        userToEmail = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            username: dto.username,
            password: hashedPassword,
            otp: otp,
            otpExpiresAt: otpExpiresAt,
          },
        });
      }
    } else {
      userToEmail = await this.prisma.user.create({
        data: {
          username: dto.username,
          email: dto.email,
          password: hashedPassword,
          otp: otp,
          otpExpiresAt: otpExpiresAt,
          isVerified: false,
        },
      });
    }

    // --- EMAIL & OTP ---
    try {
      const { error } = await this.resend.emails.send({
        from: 'TypingOn <onboarding@resend.dev>',
        to: userToEmail.email,
        subject: 'Verify your account - TypingOn',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center; background-color: #161616; color: #f4f4f5; border-radius: 10px;">
            <h2 style="color: #ffffff;">Welcome to TypingOn, ${userToEmail.username}!</h2>
            <p style="color: #a1a1aa;">Your verification code is:</p>
            <h1 style="color: #fff; letter-spacing: 5px; font-size: 36px; background-color: #0a0a0a; padding: 10px; border-radius: 8px; border: 1px solid #27272a; display: inline-block;">${otp}</h1>
            <p style="color: #a1a1aa;">This code will expire in exactly 2 minutes and 40 seconds.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Error from the Resend API:', error);
        throw new Error('Resend failed to send email');
      }
    } catch (error) {
      console.error('Error during email sending:', error);
      throw new InternalServerErrorException(
        'Error sending verification email',
      );
    }

    return {
      message: 'User registered successfully. Please check your email for OTP!',
      email: userToEmail.email,
    };
  }

  // ==========================================
  // 2. VERIFY OTP
  // ==========================================
  async verifyOtp(dto: import('./dto/verify-otp.dto').VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified!');
    }

    if (user.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP!');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new BadRequestException('OTP has expired! Please register again.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Verification successful! You can now log in.' };
  }

  // ==========================================
  // 3. LOGIN
  // ==========================================
  async login(dto: import('./dto/login.dto').LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid email or password!');
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Please verify your email before logging in!',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid email or password!');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful!',
      accessToken: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
