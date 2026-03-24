const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const { auth } = require('../middleware/auth')

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/') // 确保该目录存在
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 限制 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('只允许上传图片 (jpeg, jpg, png, gif)'))
  }
})

// 单文件上传接口
router.post('/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: '未选择文件' })
  }
  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`
  res.json({
    message: '上传成功',
    url: imageUrl
  })
})

module.exports = router
