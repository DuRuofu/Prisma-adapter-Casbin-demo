# node-casbin-demo (配合Prisma adapter)

## 一、casbin是啥？

Casbin 是一个功能强大且高效的开源访问控制库。它支持基于各种访问控制模型强制执行授权。

支持下面这些权限模型：

1. [**ACL (Access Control List)**](https://en.wikipedia.org/wiki/Access_control_list)
2. **ACL with [superuser](https://en.wikipedia.org/wiki/Superuser)**
3. **ACL without users**: especially useful for systems that don't have authentication or user log-ins.
4. **ACL without resources**: some scenarios may target for a type of resources instead of an individual resource by using permissions like , . It doesn't control the access to a specific article or log.`write-article``read-log`
5. **[RBAC (Role-Based Access Control)](https://en.wikipedia.org/wiki/Role-based_access_control)**
6. **RBAC with resource roles**: both users and resources can have roles (or groups) at the same time.
7. **RBAC with domains/tenants**: users can have different role sets for different domains/tenants.
8. **[ABAC (Attribute-Based Access Control)](https://en.wikipedia.org/wiki/Attribute-Based_Access_Control)**: syntax sugar like can be used to get the attribute for a resource.`resource.Owner`
9. **[RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer)**: supports paths like , and HTTP methods like , , , .`/res/*``/res/:id``GET``POST``PUT``DELETE`
10. **Deny-override**: both allow and deny authorizations are supported, deny overrides the allow.
11. **Priority**: the policy rules can be prioritized like firewall rules.

同时支持多语言环境：

| Feature                 | Go   | Java | Node.js | PHP  | Python | C#   | Delphi | Rust | C++  | Lua  | Dart | Elixir |
| ----------------------- | ---- | ---- | ------- | ---- | ------ | ---- | ------ | ---- | ---- | ---- | ---- | ------ |
| Enforcement             | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ✅    | ✅      |
| RBAC                    | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ✅    | ✅      |
| ABAC                    | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ✅    | ✅      |
| Scaling ABAC (`eval()`) | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ❌      | ✅    | ✅    | ✅    | ✅    | ✅      |
| Adapter                 | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ✅    | ❌      |
| Management API          | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ✅    | ✅      |
| RBAC API                | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ✅    | ✅      |
| Batch API               | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ❌      | ✅    | ✅    | ✅    | ❌    | ❌      |
| Filtered Adapter        | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ❌      | ✅    | ✅    | ✅    | ❌    | ❌      |
| Watcher                 | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ✅      | ✅    | ✅    | ✅    | ❌    | ❌      |
| Role Manager            | ✅    | ✅    | ✅       | ✅    | ✅      | ✅    | ❌      | ✅    | ✅    | ✅    | ✅    | ❌      |
| Multi-Threading         | ✅    | ✅    | ✅       | ❌    | ✅      | ❌    | ❌      | ✅    | ❌    | ❌    | ❌    | ❌      |
| 'in' of matcher         | ✅    | ✅    | ✅       | ✅    | ✅      | ❌    | ✅      | ❌    | ❌    | ❌    | ✅    | ✅      |

> 以上信息来自于casbin官网:https://v1.casbin.org

## 二、基于node-casbin结合Prisma 实现RABC权限管理

## 2.1  基于文件存储使用casbin

> 示例代码：

```ts
import { newEnforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';

async function demo() {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer('src/demo1/model.conf','src/demo1/policy.csv' );


  const sub = 'alice'; // the user that wants to access a resource.
  const obj = 'data1'; // the resource that is going to be accessed.
  const act = 'read'; // the operation that the user performs on the resource.
  if ((await e.enforce(sub, obj, act)) === true) {
    // permit alice to read data1
    console.log(true);
  } else {
    console.log(false);
    // deny the request, show an error
  }

  const roles = await e.getRolesForUser('alice');
  console.log(roles);
}

demo();

```



## 2.2  基于文件存储使用casbin

> 示例代码：

```ts
import { newEnforcer } from 'casbin';
import { PrismaAdapter } from 'casbin-prisma-adapter';

async function demo() {
  const a = await PrismaAdapter.newAdapter();
  const e = await newEnforcer('src/demo2/model.conf', a);

  const sub = 'alice'; // the user that wants to access a resource.
  const obj = 'data1'; // the resource that is going to be accessed.
  const act = 'read'; // the operation that the user performs on the resource.
  await e.addPolicy('p', 'alice', 'data1', 'read');
  await e.addPolicy('p', 'bob', 'data2', 'write');
  await e.addPolicy('p', 'data2_admin', 'data2', 'read');
  await e.addPolicy('p', 'data2_admin', 'data2', 'write');
  await e.addGroupingPolicy('alice', 'data2_admin');
  if ((await e.enforce(sub, obj, act)) === true) {
    // permit alice to read data1
    console.log(true);
  } else {
    console.log(false);
    // deny the request, show an error
  }

  const roles = await e.getRolesForUser('alice');
  console.log(roles);
}

demo();

```



## 参考:

https://www.bilibili.com/video/BV13r4y1M7AC/?spm_id_from=333.788&vd_source=ef5a0ab0106372751602034cdd9ab98e

