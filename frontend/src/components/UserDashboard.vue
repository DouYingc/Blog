<template>
  <div class="user-dashboard">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div slot="header" class="clearfix">
            <span>文章总数</span>
          </div>
          <div class="stat-value">{{ stats.articleCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div slot="header" class="clearfix">
            <span>总阅读量</span>
          </div>
          <div class="stat-value">{{ stats.totalViews }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div slot="header" class="clearfix">
            <span>总获赞数</span>
          </div>
          <div class="stat-value">{{ stats.totalLikes }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24" style="margin-bottom: 20px;">
        <el-card shadow="hover">
          <div slot="header">文章分类分布</div>
          <div ref="categoryChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header">阅读量 Top 5</div>
          <div ref="topArticlesChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
/**
 * 用户数据中心组件
 * 功能：展示用户的文章统计数据和图表，包括文章总数、总阅读量、总获赞数、文章分类分布和阅读量Top 5
 */
import axios from '../axios' // 网络请求
import * as echarts from 'echarts' // 图表库

export default {
  name: 'UserDashboard',
  data () {
    return {
      /**
       * 统计数据
       * @property {number} articleCount - 文章总数
       * @property {number} totalViews - 总阅读量
       * @property {number} totalLikes - 总获赞数
       * @property {array} categoryDistribution - 文章分类分布数据
       * @property {array} topArticles - 阅读量Top 5文章数据
       */
      stats: {
        articleCount: 0,
        totalViews: 0,
        totalLikes: 0,
        categoryDistribution: [],
        topArticles: []
      },
      categoryChart: null, // 分类分布图表实例
      topArticlesChart: null // 阅读量Top 5图表实例
    }
  },
  mounted () {
    // 组件挂载后获取统计数据并初始化图表
    this.fetchStats()
    // 添加窗口大小变化监听，用于图表自适应
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    // 组件销毁前清理事件监听器和图表实例
    window.removeEventListener('resize', this.handleResize)
    if (this.categoryChart) this.categoryChart.dispose()
    if (this.topArticlesChart) this.topArticlesChart.dispose()
  },
  methods: {
    /**
     * 获取用户统计数据
     */
    async fetchStats () {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('/stats/user-stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.stats = response.data
        this.initCharts()
      } catch (error) {
        console.error('获取统计数据失败', error)
        // 只在非401错误时显示错误信息（401错误通常由axios拦截器处理）
        if (error.response && error.response.status !== 401) {
          this.$message.error('获取统计数据失败')
        }
      }
    },
    /**
     * 初始化图表
     */
    initCharts () {
      // 初始化文章分类分布饼图
      if (this.$refs.categoryChart) {
        this.categoryChart = echarts.init(this.$refs.categoryChart)
        this.categoryChart.setOption({
          tooltip: {
            trigger: 'item'
          },
          legend: {
            bottom: '0%',
            left: 'center'
          },
          series: [
            {
              name: '文章分类',
              type: 'pie',
              radius: ['40%', '60%'], // 环形图半径
              center: ['50%', '45%'], // 图表位置
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 20,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: this.stats.categoryDistribution
            }
          ]
        })
      }

      // 初始化阅读量Top 5柱状图
      if (this.$refs.topArticlesChart) {
        this.topArticlesChart = echarts.init(this.$refs.topArticlesChart)
        // 处理文章标题，限制长度并添加省略号
        const titles = this.stats.topArticles.map(a => a.title.substring(0, 10) + (a.title.length > 10 ? '...' : ''))
        const views = this.stats.topArticles.map(a => a.views)

        this.topArticlesChart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: titles,
              axisTick: {
                alignWithLabel: true
              },
              axisLabel: {
                interval: 0,
                rotate: 30 // 标题旋转30度，避免重叠
              }
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '阅读量',
              type: 'bar',
              barWidth: '60%',
              data: views,
              itemStyle: {
                color: '#409EFF' // 柱状图颜色
              }
            }
          ]
        })
      }
    },
    /**
     * 处理窗口大小变化，调整图表尺寸
     */
    handleResize () {
      if (this.categoryChart) this.categoryChart.resize()
      if (this.topArticlesChart) this.topArticlesChart.resize()
    }
  }
}
</script>

<style scoped src="@/assets/styles/components/UserDashboard.css"></style>
