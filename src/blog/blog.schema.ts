import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BlogUser } from '../user-blog/user-blog.schema';

@Schema({ timestamps: true })
export class Blog extends Document {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  // Blog owner
  @Prop({
    type: Types.ObjectId,
    ref: BlogUser.name,
    required: true,
    index: true,
  })
  author: Types.ObjectId;

  // Cover image (Cloudinary)
  @Prop({
    type: {
      publicId: { type: String },
      url: { type: String },
    },
    _id: false,
  })
  coverImage?: {
    publicId: string;
    url: string;
  };

  // Likes (store users who liked)
  @Prop({
    type: [{ type: Types.ObjectId, ref: BlogUser.name }],
    default: [],
  })
  likes: Types.ObjectId[];

  // Soft delete
  @Prop({ default: false })
  isDeleted: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
