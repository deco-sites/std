import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.187.0/testing/mock.ts";
import {
  CONNECTION_CLOSED_MESSAGE,
  retryExceptionOr500,
} from "./fetch.server.ts";
import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

Deno.test("retry handler", async (t) => {
  await t.step("should retry when connection was closed", async () => {
    let called = 0;
    const expectedReturn = Math.random();
    const throwsException = spy(() => {
      if (called === 0) {
        called++;
        throw new Error(CONNECTION_CLOSED_MESSAGE);
      }
      return expectedReturn;
    });

    const ret = await retryExceptionOr500.execute(throwsException);
    assertSpyCalls(throwsException, 2);
    assertSpyCall(throwsException, 0, {
      error: {
        msgIncludes: CONNECTION_CLOSED_MESSAGE,
      },
    });
    assertSpyCall(throwsException, 1, {
      returned: expectedReturn,
    });

    assertEquals(ret, expectedReturn);
  });
});
