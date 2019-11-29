<template>
   <div>
<!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区域 -->
    <el-card class="box-card">
        <!-- 收索于添加 -->
        <el-row :gutter="20">
            <el-col :span="9">
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getuserList ()">
                    <el-button slot="append" icon="el-icon-search" @click="getuserList ()"></el-button>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>
    </el-card>
    <!--  用户列表页面区域-->
    <el-table :data="userlist" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="用户名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 通过作用域插座 -->
            <div>
              <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
              </el-switch>
            </div>
          </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <div>
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDalog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
            <!-- 角色分配按钮 -->
            <el-tooltip effect="dark" content="角色分配" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1,2,4,10]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">添加</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      wiDth="50%"
      @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserIfo">确 定</el-button>
      </span>
    </el-dialog>
   </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var ckeckEmail = (rule, value, callback) => {
      const regEmail = /^\w+@[a-zA-Z0-9]{2,10}(?:\.[a-z]{2,4}){1,3}$/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的邮箱'))
    }
    // 验证手机的规则
    var ckeckmoblie = (rule, value, callback) => {
      const regMobile = /^1[3|5|7|8|9]{1}[0-9]{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入正确的手机号'))
    }
    return {
      // 获取用户列表的对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示的条数
        pagesize: 10
      },
      userlist: [],
      total: 0,
      // 控制添加用户对话框显示与隐藏
      addDialogVisible: false,
      // 添加用户的数据表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的验证规则
      addFormRules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在3~10之间', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名的长度在6~15之间', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: ckeckEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: ckeckmoblie, trigger: 'blur' }]
      },
      // 控制修改用户对话框显示与隐藏
      editDialogVisible: false,
      editForm: {},
      // 修改表单的验证规则
      editFormRules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: ckeckEmail, trigger: 'blur' }],
        mobile: [{ required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: ckeckmoblie, trigger: 'blur' }]
      },
      // 删除用户
      async removeById (id) {
        const removeResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示信息', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning' }).catch(err => err)
        // 点击确定返回的数据是字符串 confirm
        // 点击取消返回的是字符串cancel
        if (removeResult !== 'confirm') return this.$message.info('您已经取消了删除')
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.info('删除用户失败')
        }
        this.$message.success('删除用户成功')
        // 刷新用户列表
        this.getuserList()
      }
    }
  },
  created () {
    this.getuserList()
  },
  methods: {
    async getuserList () {
      const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败!')
      this.userlist = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    // 监听 pageSize 的变化
    handleSizeChange (pageSize) {
      // console.log(pageSize)
      this.queryInfo.pagesize = pageSize
      this.getuserList()
    },
    // 监听 pageNum 的变化
    handleCurrentChange (pageNum) {
      // console.log(pageNum)
      this.queryInfo.pagenum = pageNum
      this.getuserList()
    },
    async userStateChanged (userState) {
      // console.log(userState)
      const { data: res } = await this.$http.put(`users/${userState.id}/state/${userState.mg_state}`)
      if (res.meta.status !== 200) {
        userState.mg_state = !userState.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 监听添加用户对话框关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getuserList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDalog (id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户失败')
      this.editForm = res.data
      this.$message.success('查询用户成功')
    },
    // 监听修改用户对话框关闭事件
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户提交
    editUserIfo () {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败')
        }
        // 提示用户修改成功
        this.$message.success('修改用户成功')
        // 刷新数据列表
        this.getuserList()
        // 关闭对话框
        this.editDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" socpe>

</style>
