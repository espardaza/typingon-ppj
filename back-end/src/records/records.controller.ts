import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { RecordsService } from './records.service';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  // 1. Endpoint to save a new typing record
  @Post()
  async createRecord(
    @Body('username') username: string,
    @Body('wpm') wpm: number,
    @Body('errors') errors: number,
    @Body('words') words?: number,
    @Body('time') time?: number,
  ) {
    return this.recordsService.saveRecord(username, wpm, errors, words, time);
  }

  // 2. Endpoint to fetch all records for a specific user
  @Get()
  async getAll(@Query('username') username: string) {
    return this.recordsService.getRecords(username);
  }

  // 3. Endpoint to delete all records for a specific user

  @Delete()
  async deleteAll(@Query('username') username: string) {
    return this.recordsService.deleteAllRecords(username);
  }

  // 4. Endpoint to delete a single record by its ID

  // Note: This must be placed AFTER the @Delete() above to prevent routing conflicts
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return this.recordsService.deleteRecord(id);
  }
}
