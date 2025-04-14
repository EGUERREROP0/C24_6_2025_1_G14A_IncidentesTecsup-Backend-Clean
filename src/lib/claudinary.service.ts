import { v2 as cloudinary, UploadApiResponse, ConfigOptions } from "cloudinary";
import { envs } from "../config";

export interface Optons {
  fileBuffer: Buffer;
  folder: string;
  fileName: string;
  resourceType: string;
}

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: envs.CLOUDINARY_CLOUD_NAME,
      api_key: envs.CLOUDINARY_API_KEY,
      api_secret: envs.CLOUDINARY_API_SECRET,
    });
  }

  public async uploadImage(
    options: Optons
  ): Promise<UploadApiResponse | undefined> {
    const {
      fileBuffer,
      folder,
      fileName = `file_${Date.now()}`,
      resourceType = "auto",
    } = options;
    const config: ConfigOptions = {
      folder: folder,
      resource_type: resourceType,
      public_id: fileName,
    };

    return new Promise<UploadApiResponse | undefined>((resolve) => {
      cloudinary.uploader
        .upload_stream(config, (error, result) => {
          if (error) {
            return resolve(undefined);
          }
          resolve(result);
        })
        .end(fileBuffer);
    });
  }
}
