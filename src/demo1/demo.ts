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
