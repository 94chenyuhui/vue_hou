<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/demo' }">
        商品管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索/添加商品区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            clearable
            v-model="queryInfo.query"
            @clear="getGoodsList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodsList"
            />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="add1"
          >
            添加商品
          </el-button>
        </el-col>
      </el-row>
      <!-- 数据表格区域 -->
      <el-table
        :data="goodslist"
        stripe
        border
      >
        <el-table-column type="index" />
        <el-table-column
          label="商品名称"
          prop="goods_name"
        />
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        />
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        />
        <el-table-column
          label="创建时间"
          prop="add_time"
          width="140px"
        >
          <template slot-scope="scope">
            <!-- 调用过滤器 -->
            <!-- 过滤器是对即将显示的数据做进一步的筛选处理，然后进行显示，值得注意的是过滤器并没有改变原来的数据，只是在原数据的基础上产生新的数据。 -->
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="130px"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="xiugai(scope.row.goods_id)"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeById(scope.row.goods_id)"
            />
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      />
    </el-card>
    <!-- 修改商品对话框 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="dialogVisible"
      width="50%"
      @close="guanbi"
    >
      <el-form
        :model="ruleForm"
        :rules="ruleFormRules"
        ref="ruleFormRef"
        label-width="100px"
      >
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
        <el-form-item
          :label="item.attr_name"
          v-for="item in ruleForm.attrs"
          :key="item.name"
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
        <el-form-item
          :label="item.attr_name"
          v-for="item in onlyTableData"
          :key="item.name"
        >
          <el-input v-model="item.attr_vals" />
        </el-form-item>
        <el-form-item
          label="商品图片"
          prop="pics"
        >
          <el-upload
            class="upload-demo"
            :action="uploadURL"
            :headers="headerObj"
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
          </el-upload>
        </el-form-item>
        <el-form-item label="商品内容">
          <!-- 富文本编辑器组件 -->
          <quill-editor v-model="ruleForm.goods_introduce" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="yes"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="yulanImg"
      width="25%"
    >
      <img
        :src="yulanImgUrl"
        class="previewImg"
      >
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0,
      // 修改对话框
      dialogVisible: false,
      // 分类级联选择器数据
      catelist: [],
      // 级联选择器的配置选项
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      ruleFormRules: {
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
      ruleForm: {
      },
      ruleForms: {
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
        // 分类动态参数/静态属性
        attrs: []

      },
      // 修改商品，默认图片
      fileList: [],
      // 商品图片上次地址
      uploadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片
      yulanImgUrl: '',
      yulanImg: false,
      id: '',
      onlyTableData: []

    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        // 查询参数
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 分页区域
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除商品
    async removeById (id) {
      const remove = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (remove !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.getGoodsList()
    },
    // 获取分类级联选择器数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.catelist = res.data
    },
    // 级联选择器改变，判断是否为三级分类
    async handleChange () {
      if (this.ruleForm.goods_cat.length !== 3) {
        this.ruleForm.goods_cat = []
        return this.$message.warning('注意：只允许设置为三级分类')
      }
    },
    // 显示修改商品对话框
    async xiugai (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }
      this.ruleForm = res.data
      // 分类级联选择器区域
      // 将分类id字符串分割为数组
      this.ruleForm.goods_cat = this.ruleForm.goods_cat.split(',')
      // 将每一个字符串数组转换为数组类型
      this.ruleForm.goods_cat.forEach((item, i, arr) => {
        this.ruleForm.goods_cat[i] = Number(this.ruleForm.goods_cat[i])
      })
      this.getCateList()
      // 上传图片区域/默认图片
      res.data.pics.forEach((item, i) => {
        const cc =
          {
            name: item.pics_big,
            url: item.pics_big_url
          }
          // 让请求到的图片参数，变为上传参数的格式
          // 判断pics对象是否存在pic对象，返回布尔值
        const ss = 'pic' in item
        if (!ss) {
          const xx = {
            pic: item.pics_big
          }
          this.ruleForm.pics[i] = xx
        }
        this.fileList.push(cc)
      })
      // 处理动态参数
      this.ruleForm.attrs.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
      })
      console.log(this.ruleForm)
      this.jingTai()
      this.dialogVisible = true
      this.id = id
      // alert(this.id)
    },
    // 获取静态属性数据
    async jingTai () {
      const { data: res } = await this.$http.get(`categories/${this.ruleForm.goods_cat[2]}/attributes`, {
        params: { sel: 'only' }
      })

      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取静态属性失败！')
      }
      this.onlyTableData = res.data
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
      const img = {
        pic: file.data.tmp_path
      }
      this.ruleForm.pics.push(img)
    },
    // 监听文件移除
    handleRemove (file) {
      // 请求到的图片参数和新上传的图片参数格式不一致，这里让新/旧图片属性参数格式变得一致
      if ('response' in file) {
        // 1. 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const i = this.ruleForm.pics.findIndex(x => x.pic === filePath)
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        this.ruleForm.pics.splice(i, 1)
      } else {
        // 1. 获取将要删除的图片的临时路径
        const filePath = file.name
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const i = this.ruleForm.pics.findIndex(x => x.pic === filePath)
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        this.ruleForm.pics.splice(i, 1)
      }
      console.log(this.ruleForm.pics)
    },
    // 提交修改信息
    yes () {
      this.$refs.ruleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        this.ruleForms.goods_name = this.ruleForm.goods_name
        this.ruleForms.goods_price = this.ruleForm.goods_price
        this.ruleForms.goods_number = this.ruleForm.goods_number
        this.ruleForms.goods_weight = this.ruleForm.goods_weight
        this.ruleForms.goods_introduce = this.ruleForm.goods_introduce
        this.ruleForms.pics = this.ruleForm.pics
        this.ruleForm.attrs.forEach(item => {
          const info = {
            attr_vals: item.attr_vals.join(' '),
            attr_id: item.attr_id
          }
          this.ruleForms.attrs.push(info)
        })
        this.onlyTableData.forEach(item => {
          const info = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals
          }
          this.ruleForms.attrs.push(info)
        })
        this.ruleForms.goods_cat = this.ruleForm.goods_cat.join(',')
        console.log(this.ruleForm)
        console.log(this.ruleForms)
        const { data: res } = await this.$http.put('goods/' + this.id, this.ruleForms)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改商品信息失败！')
        }
      })
      this.dialogVisible = false
      this.getGoodsList()
      this.id = ''
      this.$message.success('修改商品成功！')
    },
    // 编辑商品对话框，关闭后重置
    guanbi () {
      this.$refs.ruleFormRef.resetFields()
      this.fileList = []
      this.id = ''
      this.ruleForms = {
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
        // 分类动态参数/静态属性
        attrs: []
      }
      this.onlyTableData = []
    },
    // 跳转到添加商品页面
    add1 () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style >
  .previewImg {
    width: 100%;
  }
</style>
