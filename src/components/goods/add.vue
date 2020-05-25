<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert
        title="添加商品信息"
        center
        :closable="false"
        type="info"
        show-icon
      />
      <!-- 步骤条 -->
      <el-steps
        :space="400"
        :active="steps-0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息" />
        <el-step title="商品参数" />
        <el-step title="商品属性" />
        <el-step title="商品图片" />
        <el-step title="商品内容" />
        <el-step title="完成" />
      </el-steps>
      <!-- 标签页 -->
      <!-- 表单 -->
      <el-form
        label-position="top"
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-tabs
          tab-position="left"
          v-model="steps"
          @tab-click="tabclick"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息">
            <el-form-item
              label="商品名称"
              prop="goods_name"
            >
              <el-input v-model="ruleForm.goods_name" />
            </el-form-item>
            <el-form-item
              label="商品价格"
              prop="goods_price"
            >
              <el-input
                v-model="ruleForm.goods_price"
                type="number"
              />
            </el-form-item>
            <el-form-item
              label="商品重量"
              prop="goods_weight"
            >
              <el-input
                v-model="ruleForm.goods_weight"
                type="number"
              />
            </el-form-item>
            <el-form-item
              label="商品数量"
              prop="goods_number"
            >
              <el-input
                v-model="ruleForm.goods_number"
                type="number"
              />
            </el-form-item>
            <el-form-item
              label="商品分类"
              prop="goods_cat"
            >
              <el-cascader
                expand-trigger="hover"
                v-model="ruleForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange"
              />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane
            label="商品参数"
          >
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                />
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片">
            <el-upload
              :action="uploadURL"
              :headers="headerObj"
              list-type="picture"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
            >
              <el-button
                type="primary"
                size="small"
              >
                点击上传
              </el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="ruleForm.goods_introduce" />
            <!-- 添加商品的按钮 -->
            <el-button
              type="primary"
              class="btnAdd"
              @click="add"
            >
              添加商品
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
    >
      <img
        :src="previewPath"
        class="previewImg"
      >
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  data () {
    return {
      steps: '0',
      ruleForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      rules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      catelist: [],
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 商品图片上传地址
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器改变，判断是否为三级分类
    async handleChange () {
      if (this.ruleForm.goods_cat.length !== 3) {
        this.ruleForm.goods_cat = []
        return this.$message.warning('注意：只允许设置为三级分类')
      }
    },
    // 切换标签页不满足条件,返回false,阻止标签页切换
    beforeTabLeave (activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
      // return false
      if (oldActiveName === '0' && this.ruleForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 标签页切换，根据步骤条返回的当前步骤，获取动态/静态参数
    async tabclick () {
      console.log(this.steps)
      if (this.steps === '1') {
        const { data: res } = await this.$http.get(`categories/${this.ruleForm.goods_cat[2]}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
        console.log(this.manyTableData)
      } else if (this.steps === '2') {
        const { data: res } = await this.$http.get(`categories/${this.ruleForm.goods_cat[2]}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove (file) {
      // console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.ruleForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.ruleForm.pics.splice(i, 1)
      console.log(this.ruleForm)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象，push 到pics数组中
      console.log(picInfo)
      this.ruleForm.pics.push(picInfo)
      console.log(this.ruleForm.pics)
    },
    // 添加商品数据
    add () {
      // form.goods_cat = form.goods_cat.join(',')
      this.$refs.ruleForm.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 深拷贝 _.cloneDeep
        const form = _.cloneDeep(this.ruleForm)
        // 将分类id数组 拼接为字符串 用，分割
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const info = {
            attr_vals: item.attr_vals.join(' '),
            attr_id: item.attr_id
          }
          this.ruleForm.attrs.push(info)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const info = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals
          }
          this.ruleForm.attrs.push(info)
        })
        form.attrs = this.ruleForm.attrs
        console.log(form)
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          this.$router.push('/goods')
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-steps{
    margin: 20px;
  }
  .el-step__title {
    font-size: 14px;
  }
  .previewImg {
    width: 100%;
  }
  .btnAdd{
    margin-top: 20px;
  }
</style>
