<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/favicon.png">
      </div>
      <!-- 登录表单区域 -->
      <el-form
        label-width="0px"
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user"
            v-model="loginForm.username"
          />
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
            type="password"
          />
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="bths">
          <el-button
            type="primary"
            @click="login"
          >
            登录
          </el-button>
          <el-button
            type="info"
            @click="reetLoginForm"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的验证规格对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [{
          required: true, // 必选项
          message: '请输入登录名称',
          trigger: 'blur'// 失去焦点触发
        },
        {
          min: 3, // 最小长度
          max: 10, // 最大长度
          message: '长度在 3 到 10个字符',
          trigger: 'blur'// 失去焦点触发
        }
        ],
        // 验证密码是否合法
        password: [
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          }, {
            min: 6,
            max: 14,
            message: '长度在 6 到 14个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置表单
    // Element库在表单绑定 ref属性 跟值 获取表单输入框的数据，然后resetFields()，进行输入框的重置
    reetLoginForm () {
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 登录前表单预验证
    // Element库 validate(),对整个表单进行验证返回true ,false
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) {
          return
        };
        const { data: res } = await this.$http.post('login', this.loginForm)
        console.log(res)
        if (res.meta.status === 200) {
          this.$message({
            message: '登录成功',
            type: 'success',
            center: true
          })
          // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
          //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
          //   1.2 token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
          // 2. 通过编程式导航跳转到后台主页，路由地址是 /home
          window.sessionStorage.setItem('token', res.data.token)
          this.$router.push('/home')
        } else {
          this.$message.error('登录失败')
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;

      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box; //盒子溢出处理
  }
// 按钮居右对齐
  .bths {
    display: flex;
    justify-content: flex-end;
  }
</style>
