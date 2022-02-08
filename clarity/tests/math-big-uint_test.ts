
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const ONE_16 = 10000000000000000


Clarinet.test({
    name: "math-big-uint: max number",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        
        let deployer = accounts.get("deployer")!;

        let call = chain.callReadOnlyFn("math-big-uint", "maximum-integer",
            [
                types.uint(500*ONE_16), //19 digits
                types.uint(5000*ONE_16), //20 digits
            ], deployer.address);
        assertEquals(call.result, "u250000000000000000000000000000000000000") //39 digits MAX
    },
});

Clarinet.test({
    name: "math-log-exp-biguint: greater than equal to",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        
        let deployer = accounts.get("deployer")!;
        let call = chain.callReadOnlyFn("math-log-exp-biguint", "greater-than-equal-to", 
        [
            types.tuple({x: 250, exp: -4}),
            types.tuple({x: 25, exp: -3})
        ], deployer.address
        );
        call.result.expectBool(true);

        call = chain.callReadOnlyFn("math-log-exp-biguint", "greater-than-equal-to", 
        [
            types.tuple({x: 10, exp: 3}),
            types.tuple({x: 20, exp: 3})
        ], deployer.address
        );
        call.result.expectBool(false);
    },
});

Clarinet.test({
    name: "math-log-exp-biguint: ln",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        
        let deployer = accounts.get("deployer")!;
        
        let call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 5, exp: 0}),
        ], deployer.address);
        let position: any = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "16094379124341004")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 500000, exp: 0}),
        ], deployer.address);
        position = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "131223633774043286")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: "5000000000000000000", exp: 0}),
        ], deployer.address);
        position = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "430559695863269224")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 5, exp: -1}),
        ], deployer.address);
        position = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "-6931471805599458")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 1, exp: -3}),
        ], deployer.address);
        position = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "-69077552789821370")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 112451252143, exp: 0}),
        ], deployer.address);
        position = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "254457856503986790")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: -1, exp: 0}),
        ], deployer.address);
        call.result.expectErr().expectUint(5013)
        
        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 0, exp: 0}),
        ], deployer.address);
        call.result.expectErr().expectUint(5013)

        call = chain.callReadOnlyFn("math-log-exp-biguint", "ln-fixed",
            [
                types.tuple({x: 25, exp: -1}),
        ], deployer.address);
        position = call.result.expectOk().expectTuple()
        assertEquals(position['x'], "9162907318741552")
        assertEquals(position['exp'], "-16")
    },
});

Clarinet.test({
    name: "math-log-exp-biguint: multiplication-with-scientific-notation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        
        let deployer = accounts.get("deployer")!;

        let call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: 25, exp: -1}),
                types.tuple({x: 4, exp: 0}),
            ], deployer.address);
        let position: any = call.result.expectTuple()
        assertEquals(position['x'], "100")
        assertEquals(position['exp'], "-1")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: 0}),
                types.tuple({x: "1122334455667788", exp: 0}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "1259634630379109987517020812944")
        assertEquals(position['exp'], "0")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: 0}),
                types.tuple({x: "1122334455667788", exp: -16}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "1259634630379109987517020812944")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: -16}),
                types.tuple({x: "1122334455667788", exp: 0}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "1259634630379109987517020812944")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: -16}),
                types.tuple({x: "1122334455667788", exp: -16}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "1259634630379109987517020812944")
        assertEquals(position['exp'], "-32")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: 16}),
                types.tuple({x: "1122334455667788", exp: -16}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "1259634630379109987517020812944")
        assertEquals(position['exp'], "0")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: 500000, exp: 0}),
                types.tuple({x: 5, exp: -1}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "2500000")
        assertEquals(position['exp'], "-1")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "multiplication-with-scientific-notation",
            [
                types.tuple({x: 6000000, exp: 0}),
                types.tuple({x: 67, exp: -2}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "402000000")
        assertEquals(position['exp'], "-2")

    },
});

Clarinet.test({
    name: "math-log-exp-biguint: division-with-scientific-notation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        
        let deployer = accounts.get("deployer")!;

        let call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: 25, exp: -1}),
                types.tuple({x: 4, exp: 0}),
            ], deployer.address);
        let position: any = call.result.expectTuple()
        assertEquals(position['x'], "62500000000000000")
        assertEquals(position['exp'], "-17")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
        [
            types.tuple({x: "1122334455667788", exp: 0}),
            types.tuple({x: "1122334455667788", exp: 0}),
        ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "10000000000000000")
        assertEquals(position['exp'], "-16")
        
        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: 0}),
            types.tuple({x: "1122334455667788", exp: -16}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "10000000000000000")
        assertEquals(position['exp'], "0")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: -16}),
                types.tuple({x: "1122334455667788", exp: 0}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "10000000000000000")
        assertEquals(position['exp'], "-32")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: -16}),
            types.tuple({x: "1122334455667788", exp: -16}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "10000000000000000")
        assertEquals(position['exp'], "-16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: "1122334455667788", exp: 16}),
            types.tuple({x: "1122334455667788", exp: -16}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "10000000000000000")
        assertEquals(position['exp'], "16")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: 500000, exp: 0}),
            types.tuple({x: 5, exp: -1}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "1000000000000000000000")
        assertEquals(position['exp'], "-15")

        call = chain.callReadOnlyFn("math-log-exp-biguint", "division-with-scientific-notation",
            [
                types.tuple({x: 6000000, exp: 0}),
            types.tuple({x: 67, exp: -2}),
            ], deployer.address);
        position = call.result.expectTuple()
        assertEquals(position['x'], "895522388059701492537")
        assertEquals(position['exp'], "-14")

    },
});

Clarinet.test({
    name: "math-log-exp-biguint: exp-fixed",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        let deployer = accounts.get("deployer")!;
        // 0.0000005
        let call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 5, exp: -7}),
        ], deployer.address);
        let result: any = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '1000000500000125');
        result['exp'].expectInt(-15);

        // 0.02
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 2, exp: -2}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '1020201340026755');
        result['exp'].expectInt(-15);

        //0.1
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 1, exp: -1}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '1105170918075645661413597729825');
        result['exp'].expectInt(-30);

        //0.2
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 2, exp: -1}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '1221402758160167647388990560686');
        result['exp'].expectInt(-30);

        //1
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 1, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '271828182845904');
        result['exp'].expectInt(-14);

        // 4.5
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 45, exp: -1}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '900171313005218');
        result['exp'].expectInt(-13);

        // 51
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 51, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '140934908242693');
        result['exp'].expectInt(8);

        //0
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 0, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '1000000000000000');
        result['exp'].expectInt(-15);

        //-1.01
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: -101, exp: -2}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '364218979571524181');
        result['exp'].expectInt(-18);

        // -36
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: -36, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '231952283024357220');
        result['exp'].expectInt(-33);

        // 52
        call = chain.callReadOnlyFn("math-log-exp-biguint", "exp-fixed ",
        [
            types.tuple({x: 52, exp: 0}),
        ], deployer.address);
        result = call.result.expectErr().expectErr().expectUint(5012);

    },
});

Clarinet.test({
    name: "math-big-uint: pow-priv",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        let deployer = accounts.get("deployer")!;

        // 0.0000005^0.6
        let call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 50000000, exp: -14}),
            types.tuple({x: 6, exp: -1}),
        ], deployer.address);
        let result: any = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '104994678204640105');
        result['exp'].expectInt(-18);

        // 0.02^0.08
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 2, exp: -2}),
            types.tuple({x: 8, exp: -2}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '7662321819045797');
        result['exp'].expectInt(-16);

        //0.1^1
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 1, exp: -1}),
            types.tuple({x: 1, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '102817675584246604');
        result['exp'].expectInt(-18);

        // 10^100
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 10, exp: 0}),
            types.tuple({x: 10, exp: 1}),
        ], deployer.address);
        result = call.result.expectErr().expectErr().expectUint(5012);

        // 81^0
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 81, exp: 0}),
            types.tuple({x: 0, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '1000000000000000');
        result['exp'].expectInt(-15);

        // 90 ^ 9
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 9, exp: 1}),
            types.tuple({x: 9, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '387420489000000');
        result['exp'].expectInt(3);

        // 123 ^ 8
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: '12300000000', exp: -8}),
            types.tuple({x: 8, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '523890944282627');
        result['exp'].expectInt(2);

        // 123 ^ 2.46
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: '12300000000', exp: -8}),
            types.tuple({x: '246000000000', exp: -11}),
        ], deployer.address);
        result = call.result.expectErr().expectErr().expectUint(5012);

        // 21 ^ 0.0046
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: '210000', exp: -4}),
            types.tuple({x:  '46000000000000000', exp: -19}),
        ], deployer.address);
        result = call.result.expectErr().expectErr().expectUint(5012);

        //0 ^ 1
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: 0, exp: 0}),
            types.tuple({x:  1, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '233672138547078697');
        result['exp'].expectInt(-19);

        //-0.01^2
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: -1, exp: -2}),
            types.tuple({x:  2, exp: 0}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '327750807875699953');
        result['exp'].expectInt(-21);

        //-1.8 ^ 2
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: -18, exp: -2}),
            types.tuple({x:  2, exp: 0}),
        ], deployer.address);
        result = call.result.expectErr().expectErr().expectUint(5012);

        // -7.1 ^ 3.2
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: -71, exp: -1}),
            types.tuple({x:  32, exp: -1}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '534132473145821');
        result['exp'].expectInt(6);


        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: -52, exp: 0}),
            types.tuple({x:  82, exp: -1}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple()
        assertEquals(result['x'], "170637486177869")
        result['exp'].expectInt(1)

        // -37.6 ^ 11.2
        call = chain.callReadOnlyFn("math-log-exp-biguint", "pow-priv ",
        [
            types.tuple({x: -376, exp: -1}),
            types.tuple({x:  112, exp: -1}),
        ], deployer.address);
        result = call.result.expectOk().expectTuple();
        assertEquals(result['x'], '894967902944789');
        result['exp'].expectInt(7);

    },
});