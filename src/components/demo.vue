<template>
  <div>
    <el-upload
      class="upload-demo"
      action="https://www.liulongbin.top:8888/api/private/v1/upload"
      :headers="Aheaders"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :file-list="fileList"
      list-type="picture"
    >
      <el-button
        size="small"
        type="primary"
      >
        点击上传
      </el-button>
      <div
        slot="tip"
        class="el-upload__tip"
      >
        只能上传jpg/png文件，且不超过500kb
      </div>
    </el-upload>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="yulanImg"
      width="50%"
    >
      <img
        :src="yulanImgUrl"
        class="previewImg"
      >
    </el-dialog>
    <el-tabs
      v-model="id"
      @tab-click="cc"
    >
      <el-tab-pane label="基本1">
        123
      </el-tab-pane>
      <el-tab-pane label="基本2">
        123
      </el-tab-pane>
      <el-tab-pane label="基本3">
        123
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 请求头部文件
      Aheaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 默认图片
      fileList: [],
      // 预览图片
      yulanImgUrl: '',
      yulanImg: false,
      id: ''
    }
  },
  methods: {
    // 监听文件移除
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    // 监听文件预览
    handlePreview (file) {
      console.log(file.url)
      this.yulanImgUrl = file.url
      this.yulanImg = true
    },
    // 监听文件上次成功
    handleSuccess (file) {
      console.log(file)
    },
    // 请求数据
    async qingqiu () {
      const { data: res } = await this.$http.get('goods/2309')
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('获取数据失败！')
      }
      res.data.pics.forEach((item, i) => {
        const cc =
          {
            name: item.pics_big,
            url: item.pics_big_url
          }
        this.fileList.push(cc)
      })
      console.log(this.fileList)
    },
    // 标签页切换
    cc () {
      alert(this.id)
    }
  },
  created () {
    this.qingqiu()
  }
}
</script>

<style>
</style>
