import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BlogUser } from '../schemas/user-blog.schema';
import { Model } from 'mongoose';
import { UpdateProfileDto } from '../dtos/update.user.dto';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserBlogService {
  constructor(
    @InjectModel(BlogUser.name) private readonly userModel: Model<BlogUser>,
  ) {}

  async findById(id: string): Promise<BlogUser> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return {
      id: user._id,
      name: user.name,
      userName: user.userName,
      email: user.email,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updateData = { ...dto };

    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .select('-password');

    if (!updated) throw new NotFoundException('User not found');

    return {
      id: updated._id,
      name: updated.name,
      userName: updated.userName,
      email: updated.email,
    };
  }
}
