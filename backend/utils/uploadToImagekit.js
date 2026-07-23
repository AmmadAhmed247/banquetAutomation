const { imagekit } = require("../config/imagekit");

async function uploadBuffer(buffer, fileName, folder = "/") {
  const result = await imagekit.upload({
    file: buffer,         
    fileName,
    folder,
    useUniqueFileName: false, 
  });

  return {
    url: result.url,
    fileId: result.fileId,
    filePath: result.filePath,
  };
}

module.exports = { uploadBuffer };