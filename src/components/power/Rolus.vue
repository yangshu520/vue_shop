<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图 -->
        <el-card>
            <!-- 添加按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRightDialog">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="roluslist" scripe border>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbtm',index1===0?'bdtop':'','vcenter']" :key="item1.id" v-for="(item1,index1) in scope.row.children">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">
                                    {{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for 循环 嵌套渲染二级权限 -->
                                <el-row :class="[index2===0?'':'bdtop','vcenter']" :key="item2.id" v-for="(item2,index2) in item1.children">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限渲染 -->
                                    <el-col :span="13">
                                        <el-tag closable type="warning" :key="item3.id"
                                        v-for="(item3) in item2.children"
                                        @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRightById(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting"
                        @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限弹框 -->
        <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%" @close="setRightDialog">
            <el-tree :data="rightlist" :props="treeProps" show-checkbox node-key="id" default-expand-all
            :default-checked-keys="defkeys" ref="treeRef"></el-tree>
            <span slot="footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRight">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加角色弹框 -->
        <el-dialog
        title="添加角色"
        :visible.sync="addRightDialogVisible"
        width="50%" @close="addRightDialogClosed">
            <el-form :model="addForm" :rules="addFormRlus" ref="addFormRef" label-width="80px">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="addForm.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="addForm.roleDesc"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑角色弹框 -->
        <el-dialog
        title="编辑角色"
        :visible.sync="editRightDialogVisible"
        width="50%" @close="editRightDialogClosed">
            <el-form :model="editForm" :rules="eidtFormRlus" ref="editFormRef" label-width="80px">
              <el-form-item label="角色名称" prop="roleName">
                <el-input v-model="editForm.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                <el-input v-model="editForm.roleDesc"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="editRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
    // 获取角色列表的数据
      roluslist: [],
      // 角色分配是否显示
      setRightDialogVisible: false,
      // 所有权先数据
      rightlist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中节点id数组
      defkeys: [],
      // 当前即将分配角色的id值
      roleId: '',
      // 添加角色是否显示
      addRightDialogVisible: false,
      // 添加角色的数据列表
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色的验证
      addFormRlus: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3~10之间', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 6, max: 15, message: '角色描述的长度在6~15之间', trigger: 'blur' }]
      },
      // 修改角色的列表
      editForm: {},
      // 是否显示修改角色弹框
      editRightDialogVisible: false,
      // 修改角色的验证
      eidtFormRlus: {
        roleName: [{ required: true, message: '请输入修改角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '角色名称的长度在3~10之间', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入修改角色描述', trigger: 'blur' },
          { min: 6, max: 15, message: '角色描述的长度在6~15之间', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getRolusList()
  },
  methods: {
    //   获取所有角色的列表
    async getRolusList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.roluslist = res.data
      console.log(res)
    },
    // 根据id删除对应的对话框
    async removeRightById (role, rightId) {
      const removeRsult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning' }).catch(err => err)
      if (removeRsult !== 'confirm') return this.$message.info('您已经取消操作')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      this.$message.success('删除权限成功')
      // this.getRolusList()
      role.children = res.data
    },
    // 展示权限分配对话框
    async showSetRightDialog (role) {
      // 存储id值
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败')
      this.rightlist = res.data
      console.log(res)
      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defkeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色所有三级权限的id，并保存到defKeys数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点不包含children属性 就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限关闭时候重新赋值
    setRightDialog () {
      this.defkeys = []
    },
    // 点击为角色分配权限
    async allotRight () {
      const keys = [
        // 获取已选中的id  ... 展开运算符
        ...this.$refs.treeRef
          .getCheckedKeys(),
        ...this.$refs.treeRef
          .getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolusList()
      this.setRightDialogVisible = false
    },
    // 删除权限
    async removeById (id) {
      const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning' }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('您取消了该操作')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      this.getRolusList()
    },
    // 添加角色
    addRightDialog () {
      this.addRightDialogVisible = true
    },
    // 监听添加角色对话框关闭事件
    addRightDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 发送添加角色请求
    addRole () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 可以发送请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addRightDialogVisible = false
        this.getRolusList()
      })
    },
    // 根据id查询该角色
    async editRightById (id) {
      this.editRightDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      this.editForm = res.data
    },
    // 监听修改角色的关闭事件
    editRightDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 提交编辑角色
    editRole () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 可以发起请求
        const { data: res } = await this.$http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        this.getRolusList()
        this.editRightDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scope>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbtm{
    border-bottom: 1px solid #eee;
}
</style>
