<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图区域 -->
        <el-card>
            <!-- 警告区域 -->
            <el-alert show-icon title="注意:只允许为第三级分类设置相关参数!" type="warning"></el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品的分类:</span>
                    <!-- 选择商品分类的级联 -->
                    <el-cascader
                    v-model="selectedCateKeys"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange" clearable></el-cascader>
                </el-col>
            </el-row>
            <!-- tab页钱区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
              <!-- 添加参数的面板 -->
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mimin" :disabled="isBtnDisaBle" @click="addDialogVisible=true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTabData" border stripe>
                  <!-- 展开行 -->
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <!-- 循环渲染tag标签 -->
                      <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                      @close="handleClosed(index,scope.row)">{{item}}</el-tag>
                      <!-- 输入文本框 -->
                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                        ref="saveTagInput" size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
                      </el-input>
                      <!-- 添加按钮 -->
                      <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDailog(scope.row.attr_id)">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <!-- 静态属性的面板 -->
              <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mimin" :disabled="isBtnDisaBle" @click="addDialogVisible=true">添加属性</el-button>
                <!-- 静态属性表格 -->
                <el-table :data="onlyTabData" border stripe>
                  <!-- 展开行 -->
                  <el-table-column type="expand">
                    <template slot-scope="scope">
                      <!-- 循环渲染tag标签 -->
                      <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                      @close="handleClosed(index,scope.row)">{{item}}</el-tag>
                      <!-- 输入文本框 -->
                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                        ref="saveTagInput" size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
                      </el-input>
                      <!-- 添加按钮 -->
                      <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column type="index"></el-table-column>
                  <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="">
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDailog(scope.row.attr_id)">编辑</el-button>
                      <el-button type="danger" icon="el-icon-delete" size="mini"  @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数的对话框 -->
        <el-dialog
          :title="'添加'+titleText"
          :visible.sync="addDialogVisible"
          width="50%" @close="addDaiolgColesd">
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改参数的对话框 -->
        <el-dialog
          :title="'修改'+titleText"
          :visible.sync="editDialogVisible"
          width="50%" @close="editDaiolgColesd">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 获取所有商品分类的列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 级联选择框双向绑定的数据
      selectedCateKeys: [],
      // 被激活的也签的名称
      activeName: 'many',
      // 动态参数的数据
      manyTabData: [],
      // 静态属性的数据
      onlyTabData: [],
      // 控制添加对话框显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加表单的验证对象
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 控制修改对话框显示和隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editForm: {},
      // 修改表单的验证对象
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有分类的列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      this.catelist = res.data
    },
    // 级联选择框选中项会触发这个函数
    handleChange () {
      this.getParamsDate()
    },
    // tab页签点击事件的处理函数
    handleTabClick () {
      this.getParamsDate()
      console.log(this.activeName)
    },
    // 获取参数的列表数据
    async getParamsDate () {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTabData = []
        this.onlyTabData = []
      }
      // 证明选中的是三级分类
      // 根据所选分类的id，和当前所处的面板，获取相应的参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        sel: this.activeName
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        // split() 分割成数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    addDaiolgColesd () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.succsee('添加参数成功')
        this.addDialogVisible = false
        this.getParamsDate()
      })
    },
    // 点击修改按钮的对话框
    async showEditDailog (id) {
      const { data: res } = this.$http.get(`categories/${this.cateId}/attributes/` + id, { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数信息错误')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDaiolgColesd () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数提交
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改信息失败')
        }
        this.$message.succsee('修改信息失败')
        this.editDialogVisible = false
        this.getParamsDate()
      })
    },
    // 根据id删除对于的参数
    async removeParams (id) {
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/` + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.succsee('删除参数成功')
      this.getParamsDate()
    },
    // 文本框失去焦点，或摁下了enter
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 则证明输入的内容，需要后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，添加带数据库
      this.saveAttr(row)
    },
    // 将对attr_vals 的操作 保存在函数中
    async saveAttr (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 点击按钮展示文本框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick() 方法作用 就是当页面上元素被重新渲染之后，才会指定回到函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数和选项
    handleClosed (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveAttr(row)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否只返回false
    isBtnDisaBle () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 这是选中的三级id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scope>
.cat_opt{
    margin: 15px 0;
}
.el-tag{
  margin: 10px
}
.input-new-tag{
  width: 120px;
}
</style>
