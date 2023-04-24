# 用于项目打包完成后自动部署到内网服务器

项目导出clientUpdate方法,该方法接收一个对象

{
    host: '服务器ip',
    port: 22,
    username: '用户名',
    password: '密码',
    path: '/',上传zip包位置,最好不要改动
    unzipPath: '需要解压到的文件位置',
    filename: '文件名',  //打包文件名字
    localPath : '打包文件位置',
    outputFile : '打包文件位置.zip'
}