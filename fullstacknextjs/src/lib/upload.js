import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { Readable } from "stream";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Create a Multer instance with Cloudinary storage
 * @param {string} entityType - "movies" or "users"
 * @param {string} entityId - The ID of the movie or user
 */
export const cloudinaryUploader = (entityType, entityId) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            let folderPath = "movies"; // Base folder

            if (entityType === "movies") {
                // Structure: movies/movies/{movieId}/{fieldType}/...
                folderPath = `movies/movies/${entityId}`;

                if (file.fieldname === "poster") {
                    folderPath += "/poster";
                } else if (file.fieldname === "coverImage") {
                    folderPath += "/coverImage";
                } else if (file.fieldname === "castImages") {
                    folderPath += "/cast";
                }
            } else if (entityType === "users") {
                // Structure: movies/user/{userId}/profile/...
                folderPath = `movies/user/${entityId}/profile`;
            }

            return {
                folder: folderPath,
                public_id: file.originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_") + "_" + Date.now(),
                resource_type: "auto",
            };
        },
    });

    return multer({ storage: storage });
};

/**
 * Helper to convert Next.js App Router Request to Node.js IncomingMessage
 */
export function toNodeReq(req) {
    // Create a Node.js readable stream from the web request body
    const nodeReq = Readable.fromWeb(req.body);

    // Copy headers
    nodeReq.headers = {};
    req.headers.forEach((v, k) => (nodeReq.headers[k] = v));

    // Copy other properties
    nodeReq.method = req.method;
    nodeReq.url = req.url;

    return nodeReq;
}

/**
 * Helper to run middleware (like Multer) in Next.js App Router
 */
export function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}
