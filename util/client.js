const SSHClient = require('ssh2').Client;
const Client = require('scp2').Client;
const { compressZipOut, deleteZip } = require('./compressZip.js');

function createClientServer(objConfig) {
    let {host,username,password,path,unzipPath,filename,localPath,outputFile} = objConfig
    // SSH连接参数
    const sshConfig = {
        host: host,
        port: 22,
        username: username,
        password: password
    };

    // SCP连接参数
    const scpConfig = {
        host: host,
        port: 22,
        username: username,
        password: password,
        path: path, // 目标文件夹
        unzipPath: unzipPath
    };
    const remotePath = scpConfig.path;
    // 创建SSH连接
    const ssh = new SSHClient();
    ssh.on('ready', function () {
        // 创建SCP连接
        const client = new Client(scpConfig);
       
        client.on('close', function (hadError) {
            console.log(`SCP connection closed ${hadError ? 'with error' : 'successfully'}`);
            // 在上传完成后执行解压命令
            ssh.exec(`cd ../../ && unzip -o ${filename}.zip -d ${scpConfig.unzipPath} && rm -rf ${filename}.zip`, (err, stream) => {
                if (err) {
                    console.error('Failed to unzip:', err);
                    ssh.end();
                    return;
                }
                stream.on('close', (code, signal) => {
                    console.log('Unzip successful!', code);
                    // 在此处可以添加解压成功后的逻辑

                    ssh.end();
                });
                stream.on('data', data => {
                    // console.log(data.toString());
                }).stderr.on('data', function (data) {
                    // console.log('STDERR: ' + data);
                });;
            });
        });
        client.on('error', function (err) {
            // console.error('SCP error:', err);
            // 关闭SSH连接
            ssh.end();
        });
        // 上传文件
        compressZipOut(localPath, outputFile).then(() => {
            client.upload(outputFile, remotePath, function (err) {
                if (err) {
                    console.error('Upload failed:', err);
                } else {
                    console.log('Upload successful!');
                    // 上传解压成功后删除本地打包文件
                    deleteZip(outputFile)
                }
                // 关闭SCP连接
                client.close();
            });
        })

    });
    // 连接SSH
    ssh.connect(sshConfig);
}
module.exports = {
    createClientServer
}






