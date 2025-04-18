import { Multer } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileUploadService {
  async uploadFiles(
    files: Multer.File[],
  ): Promise<{ message: string; uploaded_file: any }> {
    const uploadPromises = files.map((file) => {
      return new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            display_name: file.originalname.split('.')[0],
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(file.buffer);
      });
    });
    return {
      message: 'File upload successfully',
      uploaded_file: await Promise.all(uploadPromises),
    };
  }

  async getFileDetails(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch file details: ${error.message}`);
    }
  }

  async deleteFileDetails(
    publicId: string,
  ): Promise<{ status: string; message: string }> {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { status: 'success', message: 'File deleted successfully' };
    } catch (error) {
      throw new Error(`Cloudinary delete error: ${error.message}`);
    }
  }

  async getMultipleFileDetails(ids: any): Promise<any> {
    try {
      const results = await Promise.all(
        ids?.map(async (id) => {
          try {
            const file = await cloudinary.api.resource(id);
            return { public_id: file.public_id, url: file.secure_url };
          } catch (error) {
            console.error('error on get Files details', error);
            return {
              public_id: id,
              url: '',
              error: `Failed to fetch file details for ${id}`,
            };
          }
        }),
      );

      return { file_details: results };
    } catch (error) {
      throw new Error(`Failed to fetch file details: ${error.message}`);
    }
  }
}
