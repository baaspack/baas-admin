import uploadController, { upload } from '../controllers/uploadController';

import { catchErrors } from '../handlers/errorHandlers';
import { isLoggedIn } from '../controllers/authController';

const createUploadsRoutes = (router) => {
  router.post('/uploads',
    isLoggedIn,
    upload,
    catchErrors(uploadController.uploadFile));
};

export default createUploadsRoutes;
