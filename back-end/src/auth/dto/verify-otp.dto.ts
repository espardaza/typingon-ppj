// src/auth/dto/verify-otp.dto.ts
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}
