<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button class="treeTable" type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>

            <!-- 商品列表 -->
            <tree-table :data="catelist" :columns="columns" :selection-type="false"
            :expand-type="false" border show-index index-text="#">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color:lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color:red;"></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit" @click="editCate(scope.row.cat_id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!-- 分页功能 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10,20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
            </el-row>
        </el-card>
        <!-- 添加分类的弹框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCatedialogVisible"
            width="50%" @close="addCateClosed">
            <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!-- options 用来指定数据源 -->
                    <!-- v-model 选中项绑定值 -->
                    <!-- props 用来指定配置对象 -->
                    <el-cascader
                    v-model="selectedKeys"
                    :options="parentCateList"
                    :props="{expandTrigger:'hover',value: 'cat_id',label: 'cat_name',chlidren:'chlidren'}"
                    @change="parentCateChanged" clearable change-on-select>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="addCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 修改分类的弹框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="editCatedialogVisible"
            width="50%" @close="editCateClosed">
            <el-form :model="editCateForm" :rules="editCateRules" ref="editCateFormRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="editCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateDailog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: [3],
        pagenum: 1,
        pagesize: 5
      },
      // 商品分裂的列表 默认为空
      catelist: [],
      total: 0,
      // 为table指定的定义
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        // 表示当前列定义为模版列
        type: 'template',
        // 表示当前列使用的模版名称isok
        template: 'isok'
      }, {
        label: '排序',
        // 表示当前列定义为模版列
        type: 'template',
        // 表示当前列使用的模版名称isok
        template: 'order'
      }, {
        label: '操作',
        // 表示当前列定义为模版列
        type: 'template',
        // 表示当前列使用的模版名称isok
        template: 'opt',
        minWidth: '180px'
      }],
      // 显示添加分类弹框
      addCatedialogVisible: false,
      // 添加分类的数据列表
      addCateForm: {
        // 将要添的名称
        cat_name: '',
        // 父级的id
        cat_pid: 0,
        // 默认添加的等级1级
        cat_level: 0
      },
      // 添加分类的验证规则
      addCateRules: {
        cat_name: [{ required: true, message: '请输入分类的名称', trigger: 'blur' }]
      },
      // 父级分类的数据列表
      parentCateList: [],
      // 选中的父级分类的id值
      selectedKeys: [1, 3, 9],
      // 修改商品分类的数据
      editCateForm: {},
      // 是否显示修改弹框
      editCatedialogVisible: false,
      // 修改分类的验证规则
      editCateRules: {
        cat_name: [{ required: true, message: '请输入分类的名称', trigger: 'blur' }]
      },
      // 保存修改的id
      editId: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      // console.log(res.data)
      // 数据列表 赋值给 catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize变化
    handleSizeChange (newPagesize) {
      this.queryInfo.pagesize = newPagesize
      this.getCateList()
    },
    // 监听 页码发生变化
    handleCurrentChange (newPagenum) {
      this.queryInfo.pagenum = newPagenum
      this.getCateList()
    },
    // 添加分类的弹框
    showAddCateDialog () {
      // 先获取父级分类的对话框
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    // 监听添加分类弹框的关闭事件
    addCateClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.selectedKeys = []
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { type: 2 })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }
      this.parentCateList = res.data
    },
    // 选项卡发生变化函数
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate () {
      // 先进行验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCatedialogVisible = false
      })
    },
    // 根据id删除对应的商品分类
    async removeCate (id) {
      const result = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result !== 'confirm') {
        return this.$message.info('取消了删除操作')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
    },
    // 修改商品分类
    async editCate (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询分类失败')
      this.editCateForm = res.data
      this.editId = res.data.cat_id
      this.editCatedialogVisible = true
    },
    // 监听修改弹框的关闭事件
    editCateClosed () {
      this.$refs.editCateFormRef.resetFields()
    },
    // 提交修改
    editCateDailog () {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('categories/' + this.editId, { cat_name: this.editCateForm.cat_name })
        console.log(this.editCateForm.cat_name)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('修改分类失败')
        this.$message.success('修改分类成功')
        this.getCateList()
        this.editCatedialogVisible = false
      })
    }
  }
}
</script>

<style scoped>
.treeTable{
    margin-bottom:15px
}
.el-cascader{
    width: 100%;
}
</style>
