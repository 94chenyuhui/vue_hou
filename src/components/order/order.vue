<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        订单管理
      </el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="inputs"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
            />
          </el-input>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table
        :data="tableData"
        border
        stripe
      >
        <el-table-column
          type="index"
        />
        <el-table-column
          prop="order_number"
          label="订单编号"
        />
        <el-table-column
          prop="order_price"
          label="订单价格"
        />
        <el-table-column
          prop="pay_status"
          label="是否付款"
        >
          <template slot-scope="scope">
            <el-tag
              type="success"
              v-if="scope.row.pay_status==='1'"
            >
              已付款
            </el-tag>
            <el-tag
              type="danger"
              v-else
            >
              未付款
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
        />

        <el-table-column
          prop="create_time"
          label="下单时间"
        >
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="操作"
        >
          <template>
            <el-tooltip
              effect="dark"
              content="修改地址信息"
              placement="top"
            >
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="showBox"
              />
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="物流信息"
              placement="top"
            >
              <el-button
                size="mini"
                type="success"
                icon="el-icon-location"
                @click="showProgressBox"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>
    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="dialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item
          label="省市区/县"
          prop="address1"
        >
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
          />
        </el-form-item>
        <el-form-item
          label="详细地址"
          prop="address2"
        >
          <el-input v-model="addressForm.address2" />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="dialogVisible = false"
        >确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%"
    >
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      inputs: '',
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      tableData: [],
      total: 0,
      dialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      progressVisible: false,
      progressInfo: [],
      cityData
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败！')
      }
      this.tableData = res.data.goods
      this.total = res.data.total
    },
    // 分页
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 修改地址对话框
    showBox () {
      this.dialogVisible = true
    },
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 物流信息对话框
    async showProgressBox () {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')

      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }

      this.progressInfo = res.data

      this.progressVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
