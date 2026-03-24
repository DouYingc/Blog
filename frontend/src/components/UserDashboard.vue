<template>
  <div class="user-dashboard">
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
import axios from '../axios'
import * as echarts from 'echarts'

export default {
  name: 'UserDashboard',
  data () {
    return {
      stats: {
        articleCount: 0,
        totalViews: 0,
        totalLikes: 0,
        categoryDistribution: [],
        topArticles: []
      },
      categoryChart: null,
      topArticlesChart: null
    }
  },
  mounted () {
    this.fetchStats()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    if (this.categoryChart) this.categoryChart.dispose()
    if (this.topArticlesChart) this.topArticlesChart.dispose()
  },
  methods: {
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
        // Only show error if it's not a 401 (auth handled elsewhere usually)
        if (error.response && error.response.status !== 401) {
          this.$message.error('获取统计数据失败')
        }
      }
    },
    initCharts () {
      // Category Chart
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
              radius: ['40%', '60%'], // 稍微缩小半径
              center: ['50%', '45%'], // 稍微上移
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

      // Top Articles Chart
      if (this.$refs.topArticlesChart) {
        this.topArticlesChart = echarts.init(this.$refs.topArticlesChart)
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
                rotate: 30
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
                color: '#409EFF'
              }
            }
          ]
        })
      }
    },
    handleResize () {
      if (this.categoryChart) this.categoryChart.resize()
      if (this.topArticlesChart) this.topArticlesChart.resize()
    }
  }
}
</script>

<style scoped src="@/assets/styles/components/UserDashboard.css"></style>
