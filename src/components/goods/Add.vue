<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片试图 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品区域" type="info" center show-icon></el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="已完成"></el-step>
            </el-steps>
            <!-- tab栏标签页 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeave"
                @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="proPtoins"
                            @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTabDate" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="item" v-for="(item,index) in item.attr_vals" :key="index"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTabDate" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action 表示图片上传到的后台API地址 -->
                        <el-upload :action="uploadURL" :on-preview="handlePreview"
                        :on-remove="handleRemove" list-type="picture" :headers="headerObj"
                        :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <!-- 添加商品的按钮 -->
                        <el-button @click="addCate" class="btnAdd" type="primary">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewDialogVisible"
        width="50%">
        <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单的数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品的所有分类
        goods_cat: [],
        // 上传的图片列表
        pics: [],
        // 商品详情介绍
        goods_introduce: '',
        attrs: []
      },
      // 添加表单的验证对象
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 所有商品分类的数据列表
      catelist: [],
      // 级联选择器配置项
      proPtoins: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表
      manyTabDate: [],
      // 静态属性列表
      onlyTabDate: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片的地址
      previewPath: '',
      // 是否展示图片预览窗口
      previewDialogVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.catelist = res.data
    //   console.log(this.catelist)
    },
    // 级联选择发送变化就会触发
    handleChange () {
    //   console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 切换步骤条
    beforeLeave (activeName, oldActiveName) {
      // console.log('即将进入的步骤条为:' + activeName)
      // console.log('即将离开的步骤条为:' + oldActiveName)
      // return false
      if (this.activeIndex === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品的分类')
        return false
      }
    },
    async tabClick () {
      // console.log(this.activeIndex)
      // 证明是访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabDate = res.data
        // console.log(res.data)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败')
        }
        this.onlyTabDate = res.data
        console.log(res.data)
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
    //   console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理删除图片的操作
    handleRemove (file) {
      console.log(file)
      // 1.获取将要删除的图片的路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到这个图片对应的索引
      const index = this.addForm.pics.findIndex(item =>
        item.pic === filePath
      )
      // 3.调用数组splice 方法 从pics数组中删除
      this.addForm.pics.splice(index, 1)
    //   console.log(this.addForm.pics)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
    // console.log(response)
    // 1.先拼接得到一个图片信息对象
      const picIfon = { pic: response.data.tmp_path }
      // 2.将图片信息对象，push到pics数组中
      this.addForm.pics.push(picIfon)
    // console.log(this.addForm.pics)
    },
    // 添加商品
    addCate () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // lodash cloneDeep(obj) 深拷贝
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数和静态属性
        this.manyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTabDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)
        // 商品的名称必须是唯一的
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
    margin: 0 10px 0 0!important;
}
.previewImg{
    width: 100%;
}
.btnAdd{
    margin-top: 15px;
}
</style>
