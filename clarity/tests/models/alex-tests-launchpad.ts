import {
    Account,
    Chain,
    Tx,
    ReadOnlyFn,
    types,
  } from "https://deno.land/x/clarinet@v0.14.0/index.ts";

class ALEXLaunchpad {
    chain: Chain;
    deployer: Account;

    constructor(chain: Chain, deployer: Account) {
        this.chain = chain;
        this.deployer = deployer;
    }

    createPool(sender:Account, token: string, ticket: string, feeToAddress: string, amountPerTicket: number, wstxPerTicketInFixed: number, registrationStart: number, registrationEnd: number, activationThreshold: number) {
        let block = this.chain.mineBlock([
            Tx.contractCall("alex-launchpad", "create-pool", [
                    types.principal(token),
                    types.principal(ticket),
                    types.principal(feeToAddress),
                    types.uint(amountPerTicket),
                    types.uint(wstxPerTicketInFixed),
                    types.uint(registrationStart),
                    types.uint(registrationEnd),
                    types.uint(activationThreshold),
                ],
                sender.address
            ),
        ]);
        return block;
    }
    
    addToPosition(sender:Account, token: string, tickets: number ) {
        let block = this.chain.mineBlock([
            Tx.contractCall("alex-launchpad", "add-to-position", [
                types.principal(token),
                types.uint(tickets),
            ],
            sender.address
        ),
        ]);
        return block;
    }

    register(sender:Account, token: string, ticketTrait: string, ticketAmount: number) {
        let block = this.chain.mineBlock([
            Tx.contractCall("alex-launchpad", "register", [
                types.principal(token),
                types.principal(ticketTrait),
                types.uint(ticketAmount),
                ],
                sender.address
            ),
        ]);
        return block.receipts[0].result;
    }

    claim(sender: Account, tokenTrait: string, ticketTrait: string) {
        let block = this.chain.mineBlock([
            Tx.contractCall( "alex-launchpad", "claim", [
                types.principal(tokenTrait),
                types.principal(ticketTrait),
                ],
                sender.address
            ),
        ]);
        return block;
    }
    
    getOwner():ReadOnlyFn {
        return this.chain.callReadOnlyFn(
            "alex-launchpad", 
            "get-owner", 
            [], 
            this.deployer.address
        );
    }

    setOwner(sender: Account, owner: string) {
        let block = this.chain.mineBlock([
            Tx.contractCall(
                "alex-launchpad",
                "set-owner",
                [
                    types.principal(owner)
                ],
                sender.address
            )
        ]);
        return block.receipts[0].result;
    }

    getTokenDetails(token: string): ReadOnlyFn{
        return this.chain.callReadOnlyFn(
            "alex-launchpad",
            "get-token-details",
            [
                types.principal(token)
            ],
            this.deployer.address
        )
    }

    getActivationThreshold(token: string): ReadOnlyFn{
        return this.chain.callReadOnlyFn(
            "alex-launchpad",
            "get-activation-threshold",
            [
                types.principal(token)
            ],
            this.deployer.address
        )
    }
    
    getRegisteredUsersNonce(token: string): ReadOnlyFn{
        return this.chain.callReadOnlyFn(
            "alex-launchpad",
            "get-registered-users-nonce",
            [
                types.principal(token)
            ],
            this.deployer.address
        )
    }
}
export { ALEXLaunchpad }