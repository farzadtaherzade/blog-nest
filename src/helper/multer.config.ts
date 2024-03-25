import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { Request } from "express";
import { diskStorage } from "multer";
import { generateRandomString } from "./generate";
import { extname } from "path";

export const destination = "./uploads"

export const multerOptions: MulterOptions = {
    storage: diskStorage({
        destination,
        filename: (req: Request, file: Express.Multer.File, cb: any) => {
            const uniqueName = Date.now() + generateRandomString(5)
            console.log(file)
            const ext = extname(file.originalname)
            const filename = uniqueName + ext
            cb(null, filename)
        }
    })
}