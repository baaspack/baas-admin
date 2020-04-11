import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import extract from 'extract-zip';

import { updateNginx } from '../handlers/dockerHandler';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    console.log('saving as', `${req.body.backpackName}${path.extname(file.originalname)}`);
    cb(null, `${req.body.backpackName}${path.extname(file.originalname)}`);
  },
});

export const upload = multer({ storage }).single('file');

const unZip = async (filePath, dirName) => {
  console.log('unzipping ', filePath);

  const fullDirPath = `./uploads/${dirName}`;

  fs.removeSync(fullDirPath); // Remove previous uploads

  await extract(filePath, { dir: path.resolve(`./uploads/${dirName}/`) });

  if (!(fs.existsSync(`${fullDirPath}/index.html`) || fs.existsSync(`${fullDirPath}/index.htm`))) {
    throw new Error('Please make sure there is a file named index.html in the root of your zip!');
  }
};

const uploadFile = async (req, res) => {
  console.log('uploaded');
  const filePath = req.file.path;

  await unZip(filePath, req.body.backpackName);

  updateNginx(req.body.backpackName);

  fs.unlink(filePath, (err) => {
    if (err) throw err;
  });

  return res.json({ message: 'uploaded!' });
};

const uploadController = {
  uploadFile,
};

export default uploadController;
