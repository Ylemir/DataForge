export const sampleData = {
  json: `{
  "users": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "admin",
      "active": true,
      "profile": {
        "age": 28,
        "city": "北京",
        "skills": ["JavaScript", "Python", "Go"]
      }
    },
    {
      "id": 2,
      "name": "李四",
      "email": "lisi@example.com",
      "role": "user",
      "active": true,
      "profile": {
        "age": 25,
        "city": "上海",
        "skills": ["React", "TypeScript"]
      }
    },
    {
      "id": 3,
      "name": "王五",
      "email": "wangwu@example.com",
      "role": "user",
      "active": false,
      "profile": {
        "age": 32,
        "city": "深圳",
        "skills": ["Java", "Spring"]
      }
    }
  ],
  "metadata": {
    "total": 3,
    "page": 1,
    "pageSize": 10
  }
}`,
  yaml: `# 用户配置文件
users:
  - id: 1
    name: 张三
    email: zhangsan@example.com
    role: admin
    active: true
    profile:
      age: 28
      city: 北京
      skills:
        - JavaScript
        - Python
        - Go

  - id: 2
    name: 李四
    email: lisi@example.com
    role: user
    active: true
    profile:
      age: 25
      city: 上海
      skills:
        - React
        - TypeScript

metadata:
  total: 3
  page: 1
  pageSize: 10`,
  toml: `# 应用配置
[app]
name = "DataForge"
version = "1.0.0"
debug = false

[database]
host = "localhost"
port = 5432
name = "dataforge"
user = "admin"

[server]
host = "0.0.0.0"
port = 3000
workers = 4

[[features]]
name = "query"
enabled = true
priority = 1

[[features]]
name = "transform"
enabled = true
priority = 2

[[features]]
name = "export"
enabled = false
priority = 3`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>深入理解 JavaScript</title>
    <author>张三</author>
    <price>99.00</price>
    <category>编程</category>
    <inStock>true</inStock>
  </book>
  <book id="2">
    <title>Python 实战指南</title>
    <author>李四</author>
    <price>89.00</price>
    <category>编程</category>
    <inStock>true</inStock>
  </book>
  <book id="3">
    <title>数据结构与算法</title>
    <author>王五</author>
    <price>128.00</price>
    <category>计算机科学</category>
    <inStock>false</inStock>
  </book>
</catalog>`,
  csv: `id,name,email,department,salary,joinDate
1,张三,zhangsan@example.com,工程部,15000,2022-01-15
2,李四,lisi@example.com,产品部,12000,2022-03-20
3,王五,wangwu@example.com,设计部,11000,2022-05-10
4,赵六,zhaoliu@example.com,工程部,18000,2021-08-01
5,钱七,qianqi@example.com,市场部,13000,2023-02-28`,
}

export const queryExamples = [
  { query: '.users[0].name', description: '获取第一个用户的名称' },
  { query: '.users[*].email', description: '获取所有用户的邮箱' },
  { query: '.metadata.total', description: '获取元数据中的总数' },
  { query: '.users[1].profile.skills', description: '获取第二个用户的技能列表' },
  { query: '.users[*].profile.city', description: '获取所有用户所在城市' },
]
