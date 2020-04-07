<template>
  <div>
    <el-button
      type="info"
      @click="logout"
    >
      退出
    </el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 退出登录
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
      this.$message({
        message: '退出成功',
        type: 'success',
        center: true
      })
    }
  }
}
</script>

<style>
</style>
