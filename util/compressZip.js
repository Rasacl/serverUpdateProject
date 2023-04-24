const fs = require('fs');
const path = require('path');
const archiver = require('archiver');


/**
 * 
 * @param {string} sourceFolder    设置源文件夹
 * @param {string} outputZip    输出目标文件名
 */

function compressZipOut(sourceFolder, outputZip) {
    return new Promise((resolve, reject) => {
        // 创建一个可写流，将压缩文件输出到文件中
        const output = fs.createWriteStream(outputZip);

        // 创建一个压缩对象
        const archive = archiver('zip', {
            zlib: { level: 9 } // 设置压缩级别为最高
        });

        // 将压缩对象连接到可写流
        archive.pipe(output);
        // 读取源文件夹中的所有文件和文件夹
        const files = fs.readdirSync(sourceFolder);

        // 将每个文件添加到压缩对象中
        files.forEach((file) => {
            const filePath = path.join(sourceFolder, file);
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
                archive.file(filePath, { name: file }); // 添加文件
            } else if (stats.isDirectory()) {
                archive.directory(filePath, file); // 添加文件夹
            }
        });

        // 完成压缩并关闭流
        archive.finalize();
        output.on('close', function () {
            console.log('压缩完成');
            resolve(true)
        });
    })

}

function deleteZip(localFilePath) {
    // 删除本地zip文件
    fs.unlink(localFilePath, (err) => {
        if (err) {
            console.error(`Failed to delete ${localFilePath}:`, err);
        } else {
            console.log(`Deleted ${localFilePath}`);
        }
    });
}

module.exports = {
    compressZipOut,
    deleteZip
}

