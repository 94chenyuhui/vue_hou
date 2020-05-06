<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="showAddCateDialog"
          >
            添加分类
          </el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="catelist"
        style="width: 100%;margin-bottom: 20px;"
        border
        row-key="cat_id"
        :tree-props="{children: 'children'}"
      >
        <el-table-column
          label="分类名称"
          prop="cat_name"
        />
        <el-table-column
          label="是否有效"
          prop="cat_deleted"
        >
          <template slot-scope="scope">
            <i
              class="el-icon-success"
              v-if="scope.row.cat_deleted === false"
              style="color: lightgreen;"
            />
            <i
              class="el-icon-error"
              v-else
              style="color: red;"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="权限等级"
          prop="cat_level"
        >
          <template slot-scope="scope">
            <el-tag
              size="mini"
              v-if="scope.row.cat_level===0"
            >
              一级
            </el-tag>
            <el-tag
              type="success"
              size="mini"
              v-else-if="scope.row.cat_level===1"
            >
              二级
            </el-tag>
            <el-tag
              type="warning"
              size="mini"
              v-else
            >
              三级
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="bianji(scope.row.cat_id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="shanchu(scope.row.cat_id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      width="50%"
      :visible.sync="addCateDialogVisible"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item
          label="分类名称"
          prop="cat_name"
        >
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChanged"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="addCate"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="修改分类"
      width="50%"
      :visible.sync="bianjis"
    >
      <el-form
        :model="catelists"
        :rules="addCateFormRules"
        ref="xiugairef"
        label-width="100px"
      >
        <el-form-item
          label="分类名称"
          prop="cat_name"
        >
          <el-input v-model="catelists.cat_name" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
      >
        <el-button @click=" bianjis= false">取 消</el-button>
        <el-button
          type="primary"
          @click="addbianji()"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 数据总数
      total: 0,
      treeProps: {
        children: 'children'
      },
      addCateDialogVisible: false,
      // 保存要添加分类的数据
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的权限等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 预备验证规则
      addCateFormRules: { cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 编辑对话框
      bianjis: false,
      catelists: []

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败！')
      }
      this.total = res.data.total
      this.catelist = res.data.result
      console.log(this.catelist)
    },
    // 监听 每页显示条数pagesize 改变
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 当前页数pagenum 改变
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的权限等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 删除分类对话框
    async shanchu (id) {
      console.log(id)
      const kuang = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      // console.log(confirmResult)
      if (kuang !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      console.log(res)
      this.$message.success('删除权限成功！')
      this.getCateList()
    },
    // 编辑分类对话框
    async bianji (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类ID失败！')
      }
      this.catelists = res.data
      this.bianjis = true
    },
    // 提交编辑分类对话框
    addbianji (id) {
      this.$refs.xiugairef.validate(async valid => {
        if (!valid) {
          return
        }

        const { data: res } = await this.$http.put('categories/' + this.catelists.cat_id, {
          cat_name: this.catelists.cat_name
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑失败！')
        }
        this.bianjis = false
        this.$message.success('编辑成功！')
        this.getCateList()
      })
    }

  }
}
</script>

<style lang="less" scoped>
</style>
