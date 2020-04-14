<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img
          src="../assets/heima.png"
          alt=""
        >
        <span>后台管理系统</span>
      </div>
      <el-button
        type="info"
        @click="logout"
      >
        退出
      </el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollspse?'64px':'200px'">
        <!-- 侧边栏菜单区 -->
        <div
          class="toggle-button"
          @click="toggleCollapse"
        >
          |||
        </div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollspse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id+''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 动态绑定图标 -->
              <i :class="iconsObj[item.id]" />
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu" />
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 子路由占位 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      // 所有菜单
      menulist: [],
      // 动态绑定图标
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠一级菜单
      isCollspse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
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
    },
    // 获取所有菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menulist = res.data
      console.log(this.menulist)
      console.log(res)
    },
    // 点击按钮切换菜单的折叠和展开
    toggleCollapse () {
      this.isCollspse = !this.isCollspse
    },
    // 保存链接的激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created () { // 生命周期
  // 调用获取所有菜单函数
    this.getMenuList()
    // 保持被激活的链接地址，这样即使刷新页面，所选菜单，依旧高亮
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>

  .el-container{
    height: 100%;
  }
 .el-header{
   background-color: #373d41;
   display: flex;
   justify-content: space-between;
   padding-left: 0;
   align-items: center;
   color: #fff;
   font-size: 20px;
   >div{
     display: flex;
     align-items:center;
     span{
       margin-left: 15px;
     }
   }
 }
 .el-aside{
   background-color: #333744;
   .el-menu{
     border-right: none;
   }
 }
 .el-main{
   background-color: #eaedf1;
 }
 .iconfont{
   padding-right: 15px;
 }
 .toggle-button{
   background-color: #4A5064;
   font-size: 10px;
   line-height: 24px;
   color: #fff;
   text-align: center;
   letter-spacing: 0.2em;
   cursor: pointer;
 }
</style>
