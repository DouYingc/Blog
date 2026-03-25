<template>
  <div class="article-edit">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo" @click="$router.push('/')">个人技术博客</div>
          <el-menu mode="horizontal" router :default-active="$route.path">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/user/center">个人中心</el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <el-main class="main">
        <el-page-header @back="$router.back()" :content="$route.params.id ? '编辑文章' : '发布新文章'"
          style="margin-bottom: 30px"></el-page-header>

        <el-card shadow="never" class="edit-card">
          <el-form :model="articleForm" ref="articleForm" label-width="80px">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="articleForm.title" placeholder="请输入文章标题"></el-input>
            </el-form-item>
            <el-form-item label="文章封面">
              <el-upload class="cover-uploader" action="http://localhost:3000/api/upload/image" name="image"
                :headers="uploadHeaders" :show-file-list="false" :on-success="handleCoverSuccess"
                :before-upload="beforeCoverUpload">
                <img v-if="articleForm.cover" :src="articleForm.cover" class="cover-image">
                <i v-else class="el-icon-plus cover-uploader-icon"></i>
              </el-upload>
              <small>建议尺寸 800x400，用于首页展示</small>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="所属分类">
                  <el-select v-model="articleForm.category_id" placeholder="选择分类" style="width: 100%">
                    <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文章标签">
                  <el-select v-model="articleForm.tags" multiple placeholder="选择标签" style="width: 100%">
                    <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="文章摘要">
              <el-input type="textarea" :rows="3" v-model="articleForm.summary" placeholder="请输入文章摘要"></el-input>
            </el-form-item>
            <el-form-item label="是否置顶" v-if="isAdmin">
              <el-switch v-model="articleForm.is_top" :active-value="1" :inactive-value="0"></el-switch>
            </el-form-item>
            <el-form-item label="文章内容">
              <mavon-editor v-model="articleForm.content" ref="md" @imgAdd="handleImgAdd" @change="handleContentChange"
                style="min-height: 500px" placeholder="开始创作吧..."></mavon-editor>
            </el-form-item>
            <el-form-item>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <el-button type="primary" icon="el-icon-check" @click="saveArticle">保存并发布</el-button>
                  <el-button icon="el-icon-close" @click="$router.back()">取消</el-button>
                </div>
                <span v-if="saveStatus"
                  :class="{ 'save-success': saveStatus === '已自动保存', 'save-error': saveStatus === '保存失败' }">
                  {{ saveStatus }}
                </span>
              </div>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  name: 'ArticleEdit',
  data () {
    return {
      articleForm: {
        title: '',
        category_id: null,
        tags: [],
        summary: '',
        content: '',
        html_content: '',
        status: 'published',
        cover: ''
      },
      categories: [],
      tags: [],
      uploadHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      autoSaveTimer: null,
      lastSavedContent: '',
      isSaving: false,
      saveStatus: ''
    }
  },
  computed: {
    isAdmin () {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role === 'admin'
    }
  },
  created () {
    this.fetchCategories()
    this.fetchTags()

    // 从URL参数获取生成的文章内容
    if (this.$route.query.content) {
      try {
        const content = decodeURIComponent(this.$route.query.content)
        this.articleForm.content = content

        // 尝试从文章内容中提取标题
        const titleMatch = content.match(/^#\s*(.*$)/m)
        if (titleMatch && titleMatch[1]) {
          this.articleForm.title = titleMatch[1].trim()
        }

        // 尝试提取摘要（前100个字符）
        const plainText = content.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '').replace(/\*/g, '')
        this.articleForm.summary = plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '')

      } catch (error) {
        console.error('解析文章内容失败:', error)
      }
    } else if (this.$route.params.id) {
      this.fetchArticle(this.$route.params.id)
    }

    this.lastSavedContent = this.articleForm.content
  },
  methods: {
    async fetchCategories () {
      try {
        const response = await axios.get('/categories')
        this.categories = response.data
      } catch (error) {
        this.$message.error('获取分类失败')
      }
    },
    async fetchTags () {
      try {
        const response = await axios.get('/tags')
        this.tags = response.data
      } catch (error) {
        this.$message.error('获取标签失败')
      }
    },
    async fetchArticle (id) {
      try {
        const response = await axios.get(`/articles/${id}`)
        const article = response.data

        // 权限校验：非管理员且不是自己的文章，无权编辑
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (user.role !== 'admin' && article.user_id !== user.id) {
          this.$message.error('您无权编辑他人的文章')
          this.$router.push('/')
          return
        }

        this.articleForm = {
          ...article,
          tags: article.Tags.map(t => t.id)
        }
      } catch (error) {
        this.$message.error('获取文章详情失败')
      }
    },
    handleContentChange (value, render) {
      this.articleForm.html_content = render
      this.setupAutoSave()
    },
    // 处理 mavon-editor 图片上传
    async handleImgAdd (pos, $file) {
      const formData = new FormData()
      formData.append('image', $file)
      try {
        const response = await axios.post('http://localhost:3000/api/upload/image', formData, {
          headers: {
            ...this.uploadHeaders,
            'Content-Type': 'multipart/form-data'
          }
        })
        // 将编辑器中的 base64 替换为服务器返回的 URL
        this.$refs.md.$img2Url(pos, response.data.url)
      } catch (error) {
        this.$message.error('图片上传失败')
      }
    },
    handleCoverSuccess (res) {
      this.articleForm.cover = res.url
      this.$message.success('封面上传成功')
    },
    beforeCoverUpload (file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) this.$message.error('封面只能是 JPG 或 PNG 格式!')
      if (!isLt2M) this.$message.error('封面大小不能超过 2MB!')
      return isJPG && isLt2M
    },
    setupAutoSave () {
      if (this.articleForm.content === this.lastSavedContent) {
        return
      }

      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = setTimeout(() => {
        this.autoSave()
      }, 3000)
    },

    async autoSave () {
      if (!this.articleForm.content || this.isSaving) {
        return
      }

      this.isSaving = true
      this.saveStatus = '正在保存...'

      try {
        const articleData = {
          ...this.articleForm,
          status: 'draft'
        }

        const id = this.$route.params.id
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }

        if (id) {
          await axios.put(`/articles/${id}`, articleData, config)
        } else {
          const response = await axios.post('/articles', articleData, config)
          if (!this.$route.params.id) {
            this.$route.params.id = response.data.id
          }
        }

        this.lastSavedContent = this.articleForm.content
        this.saveStatus = '已自动保存'

        setTimeout(() => {
          this.saveStatus = ''
        }, 3000)
      } catch (error) {
        this.saveStatus = '保存失败'
        console.error('自动保存失败', error)
      } finally {
        this.isSaving = false
      }
    },

    async saveArticle () {
      if (!this.articleForm.title || !this.articleForm.content) {
        this.$message.warning('标题和内容不能为空')
        return
      }
      try {
        const id = this.$route.params.id
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
        let articleId = id
        if (id) {
          await axios.put(`/articles/${id}`, this.articleForm, config)
          this.$message.success('文章更新成功')
        } else {
          const response = await axios.post('/articles', this.articleForm, config)
          articleId = response.data.id
          this.$message.success('文章发布成功')
        }

        // 跳转到文章详情页
        this.$router.push(`/article/${articleId}`)
      } catch (error) {
        this.$message.error('操作失败')
      }
    }
  },
  destroyed () {
    clearTimeout(this.autoSaveTimer)
  }
}
</script>

<style scoped src="../../assets/styles/views/ArticleEdit.css"></style>
