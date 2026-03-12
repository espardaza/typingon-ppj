import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { SnippetsService } from './snippets.service';

@Controller('snippets')
export class SnippetsController {
  constructor(private readonly snippetsService: SnippetsService) {}

  @Post()
  async create(
    @Body('username') username: string,
    @Body('content') content: string,
    @Body('defaultTime') defaultTime: number,
    @Body('tags') tags: string[],
  ) {
    return this.snippetsService.create(username, content, defaultTime, tags);
  }

  @Get()
  async findAll(@Query('username') username: string) {
    return this.snippetsService.findAll(username);
  }

  // ==========================================
  // API: DELETE 1 SNIPPET FOLLOWING ID
  // Route: DELETE /snippets/:id
  // ==========================================
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.snippetsService.deleteOne(id);
  }

  // ==========================================
  // API: DELTET ALL SNIPPET
  // Route: DELETE /snippets?username=...
  // ==========================================
  @Delete()
  async deleteAll(@Query('username') username: string) {
    if (!username) {
      throw new BadRequestException(
        'Username is required to clear all snippets',
      );
    }
    return this.snippetsService.deleteAll(username);
  }
}
