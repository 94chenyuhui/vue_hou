<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">
        首页
      </el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            @click="tianJiaJueSe"
          >
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table
        :data="rolelist"
        border
        stripe
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item,i) in scope.row.children"
              :key="item.id"
              :class="['bdbottom',i===0?'bdtop':'','vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row,item.id)"
                >
                  {{ item.authName }}
                </el-tag>

                <i class="el-icon-caret-right" />
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row
                  v-for="(item1,i1) in item.children"
                  :key="item1.id"
                  :class="[i1 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row,item1.id)"
                    >
                      {{ item1.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item2 in item1.children"
                      closable
                      :key="item2.id"
                      @close="removeRightById(scope.row,item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" />
        <el-table-column
          label="角色名称"
          prop="roleName"
        />
        <el-table-column
          label="角色描述"
          prop="roleDesc"
        />
        <el-table-column
          label="操作"
          width="300px"
        >
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="bianji(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="shanchu(scope.row.id)"
            >
              删除
            </el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addJueSe"
      width="50%"
      @close="guanbi"
    >
      <el-form
        :model="addName"
        :rules="addRules"
        label-width="100px"
        ref="addref"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input v-model="addName.roleName" />
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="roleDesc"
        >
          <el-input v-model="addName.roleDesc" />
        </el-form-item>
      </el-form>
      <span class="rigth">
        <el-button @click="addJueSe = false">取消</el-button>
        <el-button
          type="primary"
          @click="add"
        >确定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog
      title="修改角色"
      :visible.sync="xiugai"
      width="50%"
    >
      <el-form
        :model="xiugaiName"
        :rules="addRules"
        label-width="100px"
        ref="xiugairef"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input v-model="xiugaiName.roleName" />
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="roleDesc"
        >
          <el-input v-model="xiugaiName.roleDesc" />
        </el-form-item>
      </el-form>
      <span class="rigth">
        <el-button @click="xiugai = false">取消</el-button>
        <el-button
          type="primary"
          @click="xiugais"
        >确定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
    <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      />
      <span class="rigth">
        <el-button @click="setRightDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="allotRights"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有权限数据
      rightslist: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
      // 所有角色列表数据
      rolelist: [],
      // 添加角色对话框
      addJueSe: false,
      xiugai: false,
      // 添加角色信息
      addName: {
        roleName: '',
        roleDesc: ''
      },
      // 修改角色信息
      xiugaiName: [],
      // 添加和修改角色预验证规则
      addRules: {
        roleName: [{
          required: true,
          message: '请输入角色名称',
          trigger: 'blur'
        }, {
          min: 2,
          max: 5,
          message: '角色名称的长度在2~5个字符串之间',
          trigger: 'blur'
        }],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述',
            trigger: 'blur'
          }, {
            min: 5,
            max: 12,
            message: '角色名称的长度在5~12个字符串之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }

      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 根据Id删除对应的权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
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
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      // this.getRolesList() 有BUG 会重新刷新页面
      role.children = res.data// 不会重新刷新页面，只会重新刷新数据
      console.log(123)
    },
    // 添加角色按钮
    tianJiaJueSe () {
      this.addJueSe = true
    },
    // 添加角色请求
    add () {
      this.$refs.addref.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('roles', this.addName)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.addJueSe = false
        this.getRolesList()
      })
    },
    // 关闭按钮重置添加角色对话框
    guanbi () {
      this.$refs.addref.resetFields()
    },
    //  删除当前角色
    async shanchu (id) {
      console.log(id)
      const del = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (del !== 'confirm') {
        return this.$message.info('已取消删除该角色')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除该角色失败！')
      }
      this.$message.success('删除成功！')
      this.getRolesList()
      console.log(this.rolelist)
    },
    // 编辑角色按钮,打开修改对话框,获取当前角色信息
    async bianji (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色ID失败')
      }
      this.xiugaiName = res.data
      this.xiugai = true
      console.log(this.xiugaiName)
    },
    // 修改角色信息请求
    xiugais (id) {
      this.$refs.xiugairef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put('roles/' + this.xiugaiName.roleId, {
          roleDesc: this.xiugaiName.roleDesc,
          roleName: this.xiugaiName.roleName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色信息失败!')
        }
        this.$message.success('修改角色成功!')
        this.getRolesList()
        this.xiugai = false
      })
    },
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 把获取到的权限数据保存到 data 中
      this.rightslist = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      // 清空所有选定或者默认的权限
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')
      console.log(idStr)
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
  .el-tag{
    margin: 7px;
  }
  .bdtop{
    border-top:1px solid #eee ;
  }
  .bdbottom{
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
  .rigth{
    display: flex;
    justify-content: flex-end;
  }
</style>
