<template>
    <el-container class="home-container">
      <!-- 头部 -->
      <el-header>
        <div>
          <img src="../assets/heima.png" alt="">
          <span>电商管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse?'64px':'200px'">
          <div class="toggle-botton" @click="toggleCollapse">|||</div>
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened
          :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
            <el-submenu :index="item.id+''" :key="item.id" v-for="(item) in menulist">
              <!-- 模版 -->
              <template slot="title">
                <!-- 图标 -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{item.authName}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/'+subItem.path" :key="subItem.id" v-for="subItem in item.children"
              @click="saveNavState('/'+subItem.path)">
                <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template></el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 内容主题部分 -->
        <el-main>
          <!-- 路由占位符-->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 被激活的连接
      activePath: ''
    }
  },
  created () {
    this.getMenulist()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenulist () {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) return this.$message.error(this.meta.msg)
      this.menulist = res.data
      console.log(res.data)
    },
    // 点击菜单栏
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = this.activePath
    }
  }
}
</script>

<style lang="less" scoped>
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
    align-items: center;
    color:#fff;
    font-size: 20px;
    div{
      display: flex;
      align-items: center;
      span{
        margin-left: 15px;
      }
    }
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right: 0;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggle-botton{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: .2em;
    cursor: pointer;
  }
</style>
