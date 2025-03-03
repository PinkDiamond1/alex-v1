import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v0.31.1/index.ts";
import { assertEquals } from 'https://deno.land/std@0.113.0/testing/asserts.ts';
import { CRPTestAgent1 } from './models/alex-tests-collateral-rebalancing-pool.ts';
import { FWPTestAgent1 } from './models/alex-tests-fixed-weight-pool.ts';
import { YTPTestAgent1 } from './models/alex-tests-yield-token-pool.ts';
import { ReservePool } from "./models/alex-tests-reserve-pool.ts";
import { FungibleToken } from "./models/alex-tests-tokens.ts";

const ONE_8 = 100000000

const contractAddress = (contract: string) => `ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.${contract}`;

const ACTIVATION_BLOCK = 20;
const FIXED_BOUNTY = 0.01e8;
const APOWER_MULTIPLIER = ONE_8;

const liquidity = 10 * ONE_8;

const ltv_0 = 0.5e8;
const conversion_ltv = 0.9e8;
const bs_vol = 1e8;
const moving_average = 0.95e8;
const token_to_maturity = 0e8;

Clarinet.test({
    name: "collateral-rebalancing-pool-v1 auto : test",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_1 = accounts.get("wallet_1")!;
        const wallet_2 = accounts.get("wallet_2")!;
        const reservePool = new ReservePool(chain);
        const CRPTest = new CRPTestAgent1(chain, deployer);
        const FWPTest = new FWPTestAgent1(chain, deployer);
        const YTPTest = new YTPTestAgent1(chain, deployer);
        const xusdToken = new FungibleToken(chain, deployer, "token-xusd");
        const xbtcToken = new FungibleToken(chain, deployer, "token-xbtc");
        const alexToken = new FungibleToken(chain, deployer, "age000-governance-token");

        const dx = ONE_8;

        let result = xusdToken.mintFixed(deployer, deployer.address, 100000000 * ONE_8);
        result.expectOk();
        result = xusdToken.mintFixed(deployer, wallet_1.address, 200000 * ONE_8);
        result.expectOk();
        result = xbtcToken.mintFixed(deployer, deployer.address, 100000000 * ONE_8);
        result.expectOk();
        result = xbtcToken.mintFixed(deployer, wallet_1.address, 200000 * ONE_8);
        result.expectOk();
        result = xbtcToken.mintFixed(deployer, wallet_2.address, 20000 * ONE_8);
        result.expectOk();
        result = alexToken.mintFixed(deployer, deployer.address, 100000000 * ONE_8);
        result.expectOk();
        result = alexToken.mintFixed(deployer, wallet_1.address, 200000 * ONE_8);
        result.expectOk();
        result = alexToken.mintFixed(deployer, wallet_2.address, 20000 * ONE_8);  
        result.expectOk();      

        result = FWPTest.setMaxInRatio(deployer, 0.3e8);
        result.expectOk();
        result = FWPTest.setMaxOutRatio(deployer, 0.3e8);
        result.expectOk();
        result = YTPTest.setMaxInRatio(deployer, 0.3e8);
        result.expectOk();
        result = YTPTest.setMaxOutRatio(deployer, 0.3e8);
        result.expectOk();
        result = CRPTest.setMaxInRatio(deployer, 0.3e8);
        result.expectOk().expectBool(true);
        result = CRPTest.setMaxOutRatio(deployer, 0.3e8);
        result.expectOk().expectBool(true);            

        result = FWPTest.createPool(deployer, contractAddress('token-wstx'), contractAddress('token-wxusd'), 0.5e8, 0.5e8, contractAddress('fwp-wstx-wxusd-50-50-v1-01'), contractAddress('multisig-fwp-wstx-wxusd-50-50-v1-01'), liquidity, liquidity);
        result.expectOk();
        result = FWPTest.setOracleEnabled(deployer, contractAddress('token-wstx'), contractAddress('token-wxusd'), 0.5e8, 0.5e8);
        result.expectOk();
        result = FWPTest.setOracleAverage(deployer, contractAddress('token-wstx'), contractAddress('token-wxusd'), 0.5e8, 0.5e8, 0.99e8);
        result.expectOk();
        result = FWPTest.createPool(deployer, contractAddress('token-wstx'), contractAddress('token-wbtc'), 0.5e8, 0.5e8, contractAddress('fwp-wstx-wbtc-50-50-v1-01'), contractAddress('multisig-fwp-wstx-wbtc-50-50-v1-01'), liquidity, liquidity);
        result.expectOk();
        result = FWPTest.setOracleEnabled(deployer, contractAddress('token-wstx'), contractAddress('token-wbtc'), 0.5e8, 0.5e8);
        result.expectOk();
        result = FWPTest.setOracleAverage(deployer, contractAddress('token-wstx'), contractAddress('token-wbtc'), 0.5e8, 0.5e8, 0.99e8);
        result.expectOk();
        result = FWPTest.createPool(deployer, contractAddress('token-wstx'), contractAddress('age000-governance-token'), 0.5e8, 0.5e8, contractAddress('fwp-wstx-alex-50-50-v1-01'), contractAddress('multisig-fwp-wstx-alex-50-50-v1-01'), liquidity, liquidity);
        result.expectOk();
        result = FWPTest.setOracleEnabled(deployer, contractAddress('token-wstx'), contractAddress('age000-governance-token'), 0.5e8, 0.5e8);
        result.expectOk();
        result = FWPTest.setOracleAverage(deployer, contractAddress('token-wstx'), contractAddress('age000-governance-token'), 0.5e8, 0.5e8, 0.99e8);
        result.expectOk();


        // chain.mineEmptyBlockUntil(ACTIVATION_BLOCK);        

        // let block = chain.mineBlock([
        //     reservePool.addToken(deployer, contractAddress('token-wxusd')),
        //     reservePool.setActivationBlock(deployer, contractAddress('token-wxusd'), ACTIVATION_BLOCK),
        //     reservePool.setCoinbaseAmount(deployer, contractAddress('token-wxusd'), ONE_8, ONE_8, ONE_8, ONE_8, ONE_8),
        //     reservePool.setApowerMultiplierInFixed(deployer, contractAddress('token-wxusd'), APOWER_MULTIPLIER),          
        // ]);
        // block.receipts.forEach(e => { e.result.expectOk() });    
        
        let block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-approved-contract",
                [types.principal(wallet_1.address), types.bool(true)],
                deployer.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-approved-contract",
                [types.principal(deployer.address), types.bool(true)],
                deployer.address
            ),    
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-strike-multiplier",
                [types.uint(0.5e8)],
                deployer.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-expiry-cycle-length",
                [types.uint(1234)],
                deployer.address
            ),           
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-approved-pair",
                [
                    types.principal(contractAddress('auto-ytp-xusd')), 
                    types.principal(contractAddress('ytp-xusd')),
                    types.uint(ACTIVATION_BLOCK),
                    types.uint(FIXED_BOUNTY)
                ],
                deployer.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-approved-pair",
                [
                    types.principal(contractAddress('auto-key-xusd-xbtc')), 
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.uint(ACTIVATION_BLOCK),
                    types.uint(FIXED_BOUNTY)                    
                ],
                deployer.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-approved-pair",
                [
                    types.principal(contractAddress('auto-yield-xusd')), 
                    types.principal(contractAddress('yield-xusd')),
                    types.uint(ACTIVATION_BLOCK),
                    types.uint(FIXED_BOUNTY)                    
                ],
                deployer.address
            ),                     
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('token-wxusd'))], deployer.address),
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('token-wbtc'))], deployer.address),
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('auto-ytp-xusd'))], deployer.address),               
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('auto-key-xusd-xbtc'))], deployer.address),                 
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('auto-yield-xusd'))], deployer.address),   
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('yield-xusd'))], deployer.address),
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('ytp-xusd'))], deployer.address),
            Tx.contractCall("alex-vault", "add-approved-token", [types.principal(contractAddress('key-xusd-xbtc'))], deployer.address)                    
        ]);
        block.receipts.forEach(e => { e.result.expectOk() });         

        let call = chain.callReadOnlyFn("collateral-rebalancing-pool-v1", "get-expiry", [types.principal(contractAddress('ytp-xusd'))], deployer.address);
        const expiry = Number(call.result.expectOk().replace(/\D/g, ""));

        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(0)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(0)
                ],
                deployer.address
            ),            
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.principal(contractAddress('auto-key-xusd-xbtc')),
                    types.uint(0)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-xusd')),
                    types.principal(contractAddress('auto-yield-xusd')),
                    types.uint(0)
                ],
                wallet_1.address
            )                         
        ]);
        block.receipts.forEach(e => { e.result.expectErr().expectUint(2003); });        

        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(1)
                ],
                deployer.address
            ),            
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.principal(contractAddress('auto-key-xusd-xbtc')),
                    types.uint(1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-xusd')),
                    types.principal(contractAddress('auto-yield-xusd')),
                    types.uint(1)
                ],
                wallet_1.address
            )                         
        ]);
        block.receipts.forEach(e => { e.result.expectErr().expectUint(1001); });

        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-alex-v1')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-alex-v1')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(1)
                ],
                deployer.address
            ),            
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-alex-v1')),
                    types.principal(contractAddress('auto-key-xusd-xbtc')),
                    types.uint(1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-alex-v1')),
                    types.principal(contractAddress('auto-yield-xusd')),
                    types.uint(1)
                ],
                wallet_1.address
            )                         
        ]);
        block.receipts.forEach(e => { e.result.expectErr().expectUint(1000); });

        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('token-wxusd')),
                    types.uint(1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('token-wxusd')),
                    types.uint(1)
                ],
                deployer.address
            ),            
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.principal(contractAddress('token-wxusd')),
                    types.uint(1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-xusd')),
                    types.principal(contractAddress('token-wxusd')),
                    types.uint(1)
                ],
                wallet_1.address
            )                         
        ]);
        block.receipts.forEach(e => { e.result.expectErr().expectUint(1000); });

        
        result = YTPTest.createPool(deployer, expiry, contractAddress('yield-xusd'), contractAddress('token-wxusd'), contractAddress('ytp-xusd'), contractAddress('multisig-ytp-xusd'), liquidity, 0);
        result.expectOk();
        result = CRPTest.createPool(deployer, contractAddress('token-wxusd'), contractAddress('token-wbtc'), expiry, contractAddress('yield-xusd'), contractAddress('key-xusd-xbtc'), contractAddress('multisig-crp-xusd-xbtc'), ltv_0, conversion_ltv, bs_vol, moving_average, token_to_maturity, ONE_8);
        result.expectOk();        

        result = YTPTest.addToPosition(wallet_1, expiry, contractAddress('yield-xusd'), contractAddress('token-wxusd'), contractAddress('ytp-xusd'), ONE_8, Number.MAX_SAFE_INTEGER);
        result.expectOk();
        result = CRPTest.addToPosition(wallet_1, contractAddress('token-wxusd'), contractAddress('token-wbtc'), expiry, contractAddress('yield-xusd'), contractAddress('key-xusd-xbtc'), ONE_8);
        result.expectOk();

        call = chain.callReadOnlyFn(contractAddress('ytp-xusd'), "get-balance-fixed", [types.uint(expiry), types.principal(wallet_1.address)], wallet_1.address);
        const ytpAlexBalance = Number(call.result.expectOk().replace(/\D/g, ""));
        call = chain.callReadOnlyFn(contractAddress('key-xusd-xbtc'), "get-balance-fixed", [types.uint(expiry), types.principal(wallet_1.address)], wallet_1.address);
        const keyAlexAutoalexBalance = Number(call.result.expectOk().replace(/\D/g, ""));        
        call = chain.callReadOnlyFn(contractAddress('yield-xusd'), "get-balance-fixed", [types.uint(expiry), types.principal(wallet_1.address)], wallet_1.address);
        const yieldAlexBalance = Number(call.result.expectOk().replace(/\D/g, ""));    
        // console.log(yieldAlexBalance);
        
        call = chain.callReadOnlyFn(contractAddress('ytp-xusd'), "get-balance-fixed", [types.uint(expiry), types.principal(deployer.address)], deployer.address);
        const ytpAlexBalanceD = Number(call.result.expectOk().replace(/\D/g, ""));     
        
        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(ytpAlexBalance + 1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(ytpAlexBalanceD + 1)
                ],
                deployer.address
            ),            
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.principal(contractAddress('auto-key-xusd-xbtc')),
                    types.uint(keyAlexAutoalexBalance + 1)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-xusd')),
                    types.principal(contractAddress('auto-yield-xusd')),
                    types.uint(yieldAlexBalance + 1)
                ],
                wallet_1.address
            )                         
        ]);
        block.receipts.forEach(e => { e.result.expectErr(); });              

        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(ytpAlexBalance)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(ytpAlexBalanceD)
                ],
                deployer.address
            ),            
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.principal(contractAddress('auto-key-xusd-xbtc')),
                    types.uint(keyAlexAutoalexBalance)
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "mint-auto",
                [
                    types.principal(contractAddress('yield-xusd')),
                    types.principal(contractAddress('auto-yield-xusd')),
                    types.uint(yieldAlexBalance)
                ],
                wallet_1.address
            )                         
        ]);
        block.receipts.forEach(e => { e.result.expectOk(); });      
        
        call = chain.callReadOnlyFn("collateral-rebalancing-pool-v1", "get-expiry", [types.principal(contractAddress('ytp-xusd'))], deployer.address);
        assertEquals(expiry, Number(call.result.expectOk().replace(/\D/g, "")));

        chain.mineEmptyBlockUntil(expiry + 1);    

        call = chain.callReadOnlyFn("collateral-rebalancing-pool-v1", "get-expiry", [types.principal(contractAddress('ytp-xusd'))], deployer.address);
        const expiry_to_roll = Number(call.result.expectOk().replace(/\D/g, ""));
        
        block = chain.mineBlock([
            Tx.contractCall("collateral-rebalancing-pool-v1", "set-shortfall-coverage",
                [
                    types.uint(1.1e8)
                ], deployer.address
            ),   
            // Tx.contractCall("collateral-rebalancing-pool-v1", "roll-auto",
            //     [
            //         types.principal(contractAddress('ytp-xusd')),
            //         types.principal(contractAddress('token-wxusd')),
            //         types.principal(contractAddress('token-wbtc')),
            //         types.principal(contractAddress('yield-xusd')),
            //         types.principal(contractAddress('key-xusd-xbtc')),
            //         types.principal(contractAddress('auto-ytp-xusd')),
            //         types.principal(contractAddress('auto-key-xusd-xbtc'))
            //     ],
            //     wallet_1.address
            // ),                   
            Tx.contractCall("collateral-rebalancing-pool-v1", "roll-auto-pool",
                [
                    types.principal(contractAddress('yield-xusd')),                    
                    types.principal(contractAddress('token-wxusd')),
                    types.principal(contractAddress('token-wbtc')), 
                    types.principal(contractAddress('ytp-xusd')),                                       
                    types.principal(contractAddress('auto-ytp-xusd')),
                ],
                wallet_1.address
            ),
            Tx.contractCall("collateral-rebalancing-pool-v1", "roll-auto-key",
                [
                    types.principal(contractAddress('token-wxusd')),
                    types.principal(contractAddress('token-wbtc')),
                    types.principal(contractAddress('yield-xusd')),
                    types.principal(contractAddress('key-xusd-xbtc')),
                    types.principal(contractAddress('auto-key-xusd-xbtc'))
                ],
                wallet_1.address
            ),                        
            // Tx.contractCall("collateral-rebalancing-pool-v1", "add-to-position-and-switch",
            //     [
            //         types.principal(contractAddress('token-wxusd')),
            //         types.principal(contractAddress('token-wbtc')),
            //         types.uint(expiry_to_roll), 
            //         types.principal(contractAddress('yield-xusd')), 
            //         types.principal(contractAddress('key-xusd-xbtc')),
            //         types.uint(ONE_8),
            //         types.some(types.uint(0))
            //     ],
            //     wallet_2.address
            // ),       
            // Tx.contractCall("collateral-rebalancing-pool-v1", "roll-auto-yield",
            //     [
            //         types.principal(contractAddress('yield-xusd')),
            //         types.principal(contractAddress('token-wxusd')),
            //         types.principal(contractAddress('token-wbtc')),
            //         types.principal(contractAddress('auto-yield-xusd'))
            //     ],
            //     wallet_1.address
            // ),               
        ]);
        block.receipts.forEach(e => { e.result.expectOk(); });
        // console.log(block.receipts[2].result);

        block = chain.mineBlock([            
            Tx.contractCall("collateral-rebalancing-pool-v1", "redeem-auto",
                [
                    types.principal(contractAddress('ytp-xusd')),
                    types.principal(contractAddress('auto-ytp-xusd')),
                    types.uint(ONE_8)
                ],
                deployer.address
            )
        ]);
        block.receipts.forEach(e => 
            { 
                e.result.expectOk();
                console.log(e.events);
            }
        );                      
    }
});
