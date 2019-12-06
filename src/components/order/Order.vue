<template>
    <div>
     <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图 -->
    <el-card>
        <el-row>
            <el-col :span="14">
                <el-input placeholder="请输入内容">
                    <el-button slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </el-col>
        </el-row>
        <!-- 订单列表数据 -->
        <el-table :data="orderlist" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="订单编号" prop="order_number"></el-table-column>
            <el-table-column label="订单价格" prop="order_price"></el-table-column>
            <el-table-column label="是否付款" prop="pay_status">
                <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.pay_status=='1'">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="是否发货" prop="is_send"></el-table-column>
            <el-table-column label="下单时间" prop="create_time">
                <template slot-scope="scope">
                    {{scope.row.create_time | dataFormat}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180px;">
                <template>
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBox">地址</el-button>
                    <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox">物流</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>
    </el-card>
    <!-- 修改地址的对话框 -->
    <el-dialog
        title="修改地址" :visible.sync="eidtDialogVisible"
        width="50%" @close="addressClosed">
        <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省市区/县" prop="address1">
                <el-cascader v-model="addressForm.address2" :options="cityDate" :props="{ expandTrigger: 'hover' }">
                </el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="eidtDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="eidtDialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
    <!--  展示物流进度的对话框-->
    <el-dialog
        title="物流进度" :visible.sync="showDialogVisible"
        width="50%">
        <!-- 时间先 -->
        <el-timeline>
            <el-timeline-item v-for="(item, index) in progressInfo"
            :key="index"
            :timestamp="item.time">
            {{item.context}}
            </el-timeline-item>
        </el-timeline>
    </el-dialog>
    </div>
</template>

<script>
import cityDate from './citydata.js'
import progressInfo from './progressInfo.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      orderlist: [],
      // 总条数
      total: 0,
      eidtDialogVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      // 验证规则
      addressRules: {
        address1: [{ required: true, message: '请选择省市/区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细的地址', trigger: 'blur' }]
      },
      cityDate: cityDate,
      showDialogVisible: false,
      // 物流信息列表
      progressInfo: progressInfo
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.orderlist = res.data.goods
      this.total = res.data.total
    //   console.log(res)
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    editBox () {
      this.eidtDialogVisible = true
    },
    // 监听对话框关闭事件
    addressClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox () {
    //   const { data: res } = await this.$http.get('/kuaidi/' + 1106975712662)
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('获取物流信息失败')
    //   }
    //   console.log(res)
    //   this.progressInfo = res.data
      this.showDialogVisible = true
    }

  }
}
</script>
<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
</style>
