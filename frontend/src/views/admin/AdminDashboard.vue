<template>
  <div class="admin-dashboard">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">文章总数</div>
          <div class="stat-value">{{ summary.articleCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">注册用户</div>
          <div class="stat-value">{{ summary.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">全站评论</div>
          <div class="stat-value">{{ summary.commentCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-title">总阅读量</div>
          <div class="stat-value">{{ summary.totalViews }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 30px">
      <el-col :span="16">
        <el-card header="文章发布趋势 (近7天)" shadow="never">
          <div ref="trendChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card header="文章分类分布" shadow="never">
          <div ref="pieChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from '../../axios'
import * as echarts from 'echarts'

export default {
  name: 'AdminDashboard',
  data () {
    return {
      summary: {
        articleCount: 0,
        userCount: 0,
        commentCount: 0,
        totalViews: 0
      }
    }
  },
  mounted () {
    this.fetchSummary()
    this.initTrendChart()
    this.initPieChart()
  },
  methods: {
    async fetchSummary () {
      try {
        const response = await axios.get('/stats/summary', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.summary = response.data
      } catch (error) {
        console.error('获取统计数据失败', error)
      }
    },
    async initTrendChart () {
      const chart = echarts.init(this.$refs.trendChart)
      try {
        const response = await axios.get('/stats/trend', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = response.data

        chart.setOption({
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: data.map(item => item.date)
          },
          yAxis: { type: 'value' },
          series: [{
            data: data.map(item => item.count),
            type: 'line',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            },
            itemStyle: { color: '#409eff' }
          }]
        })
      } catch (error) {
        console.error('获取趋势图失败', error)
      }
    },
    async initPieChart () {
      const chart = echarts.init(this.$refs.pieChart)
      try {
        const response = await axios.get('/stats/categories', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const data = response.data

        chart.setOption({
          tooltip: { trigger: 'item' },
          legend: { bottom: '0%', left: 'center' },
          series: [
            {
              name: '文章数量',
              type: 'pie',
              radius: ['40%', '60%'],
              center: ['50%', '45%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: { show: false, position: 'center' },
              emphasis: {
                label: { show: true, fontSize: 20, fontWeight: 'bold' }
              },
              labelLine: { show: false },
              data: data.map(item => ({
                name: item.name,
                value: item.articleCount
              }))
            }
          ]
        })
      } catch (error) {
        console.error('获取饼图失败', error)
      }
    }
  }
}
</script>

<style scoped>
.stat-card {
  text-align: center;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
</style>
