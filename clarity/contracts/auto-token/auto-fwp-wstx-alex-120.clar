(impl-trait .trait-ownable.ownable-trait)
(impl-trait .trait-sip-010.sip-010-trait)

(define-constant ERR-NOT-AUTHORIZED (err u1000))

(define-fungible-token auto-fwp-wstx-alex-120)

(define-data-var contract-owner principal tx-sender)
(define-map approved-contracts principal bool)

(define-data-var token-name (string-ascii 32) "Auto STX / ALEX Pool 120")
(define-data-var token-symbol (string-ascii 32) "auto-fwp-wstx-alex-120")
(define-data-var token-uri (optional (string-utf8 256)) (some u"https://cdn.alexlab.co/metadata/token-auto-fwp-wstx-alex-120.json"))

(define-data-var token-decimals uint u8)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-public (set-contract-owner (owner principal))
  (begin
    (try! (check-is-owner))
    (ok (var-set contract-owner owner))
  )
)

;; --- Authorisation check

(define-private (check-is-owner)
  (ok (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED))
)

(define-private (check-is-approved)
  (ok (asserts! (default-to false (map-get? approved-contracts tx-sender)) ERR-NOT-AUTHORIZED))
)

;; Other

(define-public (set-name (new-name (string-ascii 32)))
	(begin
		(try! (check-is-owner))
		(ok (var-set token-name new-name))
	)
)

(define-public (set-symbol (new-symbol (string-ascii 32)))
	(begin
		(try! (check-is-owner))
		(ok (var-set token-symbol new-symbol))
	)
)

(define-public (set-decimals (new-decimals uint))
	(begin
		(try! (check-is-owner))
		(ok (var-set token-decimals new-decimals))
	)
)

(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
	(begin
		(try! (check-is-owner))
		(ok (var-set token-uri new-uri))
	)
)

(define-public (add-approved-contract (new-approved-contract principal))
	(begin
		(try! (check-is-owner))
		(ok (map-set approved-contracts new-approved-contract true))
	)
)

(define-public (set-approved-contract (owner principal) (approved bool))
	(begin
		(try! (check-is-owner))
		(ok (map-set approved-contracts owner approved))
	)
)

;; --- Public functions

;; sip010-ft-trait

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq sender tx-sender) ERR-NOT-AUTHORIZED)
        (try! (ft-transfer? auto-fwp-wstx-alex-120 amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)
    )
)

(define-read-only (get-name)
	(ok (var-get token-name))
)

(define-read-only (get-symbol)
	(ok (var-get token-symbol))
)

(define-read-only (get-decimals)
	(ok (var-get token-decimals))
)

(define-read-only (get-balance (who principal))
	(ok (ft-get-balance auto-fwp-wstx-alex-120 who))
)

(define-read-only (get-total-supply)
	(ok (ft-get-supply auto-fwp-wstx-alex-120))
)

(define-read-only (get-token-uri)
	(ok (var-get token-uri))
)

;; --- Protocol functions

(define-constant ONE_8 u100000000)

;; @desc mint
;; @restricted ContractOwner/Approved Contract
;; @params token-id
;; @params amount
;; @params recipient
;; @returns (response bool)
(define-public (mint (amount uint) (recipient principal))
	(begin		
		(asserts! (or (is-ok (check-is-approved)) (is-ok (check-is-owner))) ERR-NOT-AUTHORIZED)
		(ft-mint? auto-fwp-wstx-alex-120 amount recipient)
	)
)

;; @desc burn
;; @restricted ContractOwner/Approved Contract
;; @params token-id
;; @params amount
;; @params sender
;; @returns (response bool)
(define-public (burn (amount uint) (sender principal))
	(begin
		(asserts! (or (is-ok (check-is-approved)) (is-ok (check-is-owner))) ERR-NOT-AUTHORIZED)
		(ft-burn? auto-fwp-wstx-alex-120 amount sender)
	)
)

;; @desc pow-decimals
;; @returns uint
(define-private (pow-decimals)
  (pow u10 (unwrap-panic (get-decimals)))
)

;; @desc fixed-to-decimals
;; @params amount
;; @returns uint
(define-read-only (fixed-to-decimals (amount uint))
  (/ (* amount (pow-decimals)) ONE_8)
)

;; @desc decimals-to-fixed 
;; @params amount
;; @returns uint
(define-private (decimals-to-fixed (amount uint))
  (/ (* amount ONE_8) (pow-decimals))
)

;; @desc get-total-supply-fixed
;; @params token-id
;; @returns (response uint)
(define-read-only (get-total-supply-fixed)
  (ok (decimals-to-fixed (unwrap-panic (get-total-supply))))
)

;; @desc get-balance-fixed
;; @params token-id
;; @params who
;; @returns (response uint)
(define-read-only (get-balance-fixed (account principal))
  (ok (decimals-to-fixed (unwrap-panic (get-balance account))))
)

;; @desc transfer-fixed
;; @params token-id
;; @params amount
;; @params sender
;; @params recipient
;; @returns (response bool)
(define-public (transfer-fixed (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (transfer (fixed-to-decimals amount) sender recipient memo)
)

;; @desc mint-fixed
;; @params token-id
;; @params amount
;; @params recipient
;; @returns (response bool)
(define-public (mint-fixed (amount uint) (recipient principal))
  (mint (fixed-to-decimals amount) recipient)
)

;; @desc burn-fixed
;; @params token-id
;; @params amount
;; @params sender
;; @returns (response bool)
(define-public (burn-fixed (amount uint) (sender principal))
  (burn (fixed-to-decimals amount) sender)
)

(define-private (mint-fixed-many-iter (item {amount: uint, recipient: principal}))
	(mint-fixed (get amount item) (get recipient item))
)

(define-public (mint-fixed-many (recipients (list 200 {amount: uint, recipient: principal})))
	(begin
		(asserts! (or (is-ok (check-is-approved)) (is-ok (check-is-owner))) ERR-NOT-AUTHORIZED)
		(ok (map mint-fixed-many-iter recipients))
	)
)

;; yield vault - fwp-wstx-alex-50-50-v1-01

;; constants
;;
(define-constant ERR-INVALID-LIQUIDITY (err u2003))
(define-constant ERR-REWARD-CYCLE-NOT-COMPLETED (err u10017))
(define-constant ERR-STAKING-NOT-AVAILABLE (err u10015))
(define-constant ERR-GET-BALANCE-FIXED-FAIL (err u6001))
(define-constant ERR-NOT-ACTIVATED (err u2043))
(define-constant ERR-ACTIVATED (err u2044))
(define-constant ERR-USER-ID-NOT-FOUND (err u10003))
(define-constant ERR-INSUFFICIENT-BALANCE (err u2045))
(define-constant ERR-INVALID-PERCENT (err u5000))

(define-data-var end-cycle uint u120)
(define-data-var start-block uint u340282366920938463463374607431768211455)

(define-read-only (get-start-block)
  (var-get start-block)
)

(define-public (set-start-block (new-start-block uint))
  (begin 
    (try! (check-is-owner))
    (ok (var-set start-block new-start-block))
  )
)

(define-read-only (get-end-cycle)
  (var-get end-cycle)
)

(define-public (set-end-cycle (new-end-cycle uint))
  (begin 
    (try! (check-is-owner))
    (ok (var-set end-cycle new-end-cycle))
  )
)

;; data maps and vars
;;
(define-data-var total-supply uint u0)

(define-data-var bounty-in-fixed uint u1000000000) ;; 10 ALEX

(define-read-only (get-bounty-in-fixed)
  (ok (var-get bounty-in-fixed))
)

(define-public (set-bounty-in-fixed (new-bounty-in-fixed uint))
  (begin 
    (try! (check-is-owner))
    (ok (var-set bounty-in-fixed new-bounty-in-fixed))
  )
)

;; private functions
;;
(define-private (get-alex-staking-reward (reward-cycle uint))
  (contract-call? .alex-reserve-pool get-staking-reward .age000-governance-token (get-alex-user-id) reward-cycle)
)
(define-private (get-staking-reward (reward-cycle uint))
  (contract-call? .alex-reserve-pool get-staking-reward .fwp-wstx-alex-50-50-v1-01 (get-user-id) reward-cycle)
)
(define-private (get-alex-staker-at-cycle (reward-cycle uint))
  (contract-call? .alex-reserve-pool get-staker-at-cycle-or-default .age000-governance-token reward-cycle (get-alex-user-id))
)
(define-private (get-staker-at-cycle (reward-cycle uint))
  (contract-call? .alex-reserve-pool get-staker-at-cycle-or-default .fwp-wstx-alex-50-50-v1-01 reward-cycle (get-user-id))
)
(define-private (get-alex-user-id)
  (default-to u0 (contract-call? .alex-reserve-pool get-user-id .age000-governance-token tx-sender))
)
(define-private (get-user-id)
  (default-to u0 (contract-call? .alex-reserve-pool get-user-id .fwp-wstx-alex-50-50-v1-01 tx-sender))
)
(define-private (get-alex-reward-cycle (stack-height uint))
  (contract-call? .alex-reserve-pool get-reward-cycle .age000-governance-token stack-height)
)
(define-private (get-reward-cycle (stack-height uint))
  (contract-call? .alex-reserve-pool get-reward-cycle .fwp-wstx-alex-50-50-v1-01 stack-height)
)
(define-private (stake-alex-tokens (amount-tokens uint) (lock-period uint))
  (contract-call? .alex-reserve-pool stake-tokens .age000-governance-token amount-tokens lock-period)
)
(define-private (stake-tokens (amount-tokens uint) (lock-period uint))
  (contract-call? .alex-reserve-pool stake-tokens .fwp-wstx-alex-50-50-v1-01 amount-tokens lock-period)
)
(define-private (claim-alex-staking-reward (reward-cycle uint))
  (contract-call? .alex-reserve-pool claim-staking-reward .age000-governance-token reward-cycle)
)
(define-private (claim-staking-reward (reward-cycle uint))
  (contract-call? .alex-reserve-pool claim-staking-reward .fwp-wstx-alex-50-50-v1-01 reward-cycle)
)

;; public functions
;;   

;; @desc get the next capital base of the vault
;; @desc next-base = principal to be staked at the next cycle 
;; @desc           + principal to be claimed at the next cycle and staked for the following cycle
;; @desc           + reward to be claimed at the next cycle and staked for the following cycle
(define-read-only (get-next-base)
  (let 
    (
      (current-cycle (unwrap! (get-reward-cycle block-height) ERR-STAKING-NOT-AVAILABLE))
      (principal 
        (+ 
          (get amount-staked (as-contract (get-staker-at-cycle (+ current-cycle u1)))) 
          (get to-return (as-contract (get-staker-at-cycle current-cycle)))
        )
      )
      (rewards 
        (+ 
          (as-contract (get-staking-reward current-cycle))
          (get amount-staked (as-contract (get-alex-staker-at-cycle (+ current-cycle u1)))) 
          (get to-return (as-contract (get-alex-staker-at-cycle current-cycle)))
          (as-contract (get-alex-staking-reward current-cycle))
        )
      )
    )
    (ok { principal: principal, rewards: rewards })
  )
)

;; @desc get the intrinsic value of auto-alex
;; @desc intrinsic = next capital base of the vault / total supply of auto-alex
(define-read-only (get-intrinsic)
  (let 
    (
      (next-base (try! (get-next-base)))
    )
    (ok { principal: (div-down (get principal next-base) (var-get total-supply)), rewards: (div-down (get rewards next-base) (var-get total-supply)) })
  )  
)

(define-read-only (get-token-given-position (dx uint))
  (let 
    (
      (next-base (try! (get-next-base)))
    )
    (ok 
      (if (is-eq u0 (var-get total-supply))
        { token: dx, rewards: u0 }
        { 
          token: dx, ;;(div-down (mul-down (var-get total-supply) dx) (get principal next-base)), 
          rewards: (div-down (mul-down (get rewards next-base) dx) (get principal next-base))
        }
      )
    )
  )
)

(define-read-only (is-cycle-bountiable (reward-cycle uint))
  (> (as-contract (get-staking-reward reward-cycle)) (var-get bounty-in-fixed))
)

;; @desc add to position
;; @desc transfers dx to vault, stake them for 32 cycles and mints auto-alex, the number of which is determined as % of total supply / next base
;; @param dx the number of $ALEX in 8-digit fixed point notation
(define-public (add-to-position (dx uint))
  (let
    (      
      (current-cycle (unwrap! (get-reward-cycle block-height) ERR-STAKING-NOT-AVAILABLE))
    )
    (asserts! (> (var-get end-cycle) current-cycle) ERR-STAKING-NOT-AVAILABLE)
    (asserts! (>= block-height (var-get start-block)) ERR-NOT-ACTIVATED)
    (asserts! (> dx u0) ERR-INVALID-LIQUIDITY)
    
    (let
      (
        (sender tx-sender)
        (cycles-to-stake (if (> (var-get end-cycle) (+ current-cycle u32)) u32 (- (var-get end-cycle) current-cycle)))
        (new-supply (try! (get-token-given-position dx)))      
        (new-total-supply (+ (var-get total-supply) (get token new-supply)))
      )
      ;; transfer dx to contract to stake for max cycles
      (try! (contract-call? .fwp-wstx-alex-50-50-v1-01 transfer-fixed dx sender (as-contract tx-sender) none))
      (as-contract (try! (stake-tokens dx cycles-to-stake)))

      (and 
        (> (get rewards new-supply) u0) 
        (try! (contract-call? .age000-governance-token transfer-fixed (get rewards new-supply) sender (as-contract tx-sender) none))
        (as-contract (try! (stake-alex-tokens (get rewards new-supply) cycles-to-stake)))
      )
        
      ;; mint pool token and send to tx-sender
      (var-set total-supply new-total-supply)
	    (try! (ft-mint? auto-fwp-wstx-alex-120 (fixed-to-decimals (get token new-supply)) sender))
      (print { object: "pool", action: "position-added", data: { new-supply: (get token new-supply), total-supply: new-total-supply }})
      (ok true)
    )
  )
)

;; @desc triggers external event that claims all that's available and stake for another 32 cycles
;; @desc this can be triggered by anyone at a fee (at the moment 0.1% of whatever is claimed)
;; @param reward-cycle the target cycle to claim (and stake for current cycle + 32 cycles). reward-cycle must be < current cycle.
(define-public (claim-and-stake (reward-cycle uint))
  (let 
    (      
      ;; claim all that's available to claim for the reward-cycle
      (claimed (and (> (as-contract (get-user-id)) u0) (is-ok (as-contract (claim-staking-reward reward-cycle)))))
      (alex-claimed (and (> (as-contract (get-alex-user-id)) u0) (is-ok (as-contract (claim-alex-staking-reward reward-cycle)))))
      (alex-balance (unwrap! (contract-call? .age000-governance-token get-balance-fixed (as-contract tx-sender)) ERR-GET-BALANCE-FIXED-FAIL))
      (principal-balance (unwrap! (contract-call? .fwp-wstx-alex-50-50-v1-01 get-balance-fixed (as-contract tx-sender)) ERR-GET-BALANCE-FIXED-FAIL))
      (bounty (var-get bounty-in-fixed))
      (current-cycle (unwrap! (get-reward-cycle block-height) ERR-STAKING-NOT-AVAILABLE))
    )
    (asserts! (>= block-height (var-get start-block)) ERR-NOT-ACTIVATED)
    (asserts! (> current-cycle reward-cycle) ERR-REWARD-CYCLE-NOT-COMPLETED)
    (asserts! (> alex-balance bounty) ERR-INSUFFICIENT-BALANCE)
    (asserts! (>= (var-get end-cycle) current-cycle) ERR-STAKING-NOT-AVAILABLE)

    (let 
      (
        (sender tx-sender)
        (cycles-to-stake (if (>= (var-get end-cycle) (+ current-cycle u32)) u32 (- (var-get end-cycle) current-cycle)))
      )
      (and (> principal-balance u0) (> cycles-to-stake u0) (as-contract (try! (stake-tokens principal-balance cycles-to-stake))))
      (and (> cycles-to-stake u0) (as-contract (try! (stake-alex-tokens (- alex-balance bounty) cycles-to-stake))))
      (and (> bounty u0) (as-contract (try! (contract-call? .age000-governance-token transfer-fixed bounty tx-sender sender none))))
    
      (ok true)
    )
  )
)


(define-public (reduce-position (percent uint))
  (let 
    (
      (sender tx-sender)
      (current-cycle (unwrap! (get-reward-cycle block-height) ERR-STAKING-NOT-AVAILABLE))
      ;; claim last cycle just in case claim-and-stake has not yet been triggered    
      (claimed (as-contract (try! (claim-staking-reward (var-get end-cycle)))))
      (alex-claimed (as-contract (try! (claim-alex-staking-reward (var-get end-cycle)))))
      (alex-balance (unwrap! (contract-call? .age000-governance-token get-balance-fixed (as-contract tx-sender)) ERR-GET-BALANCE-FIXED-FAIL))
      (principal-balance (unwrap! (contract-call? .fwp-wstx-alex-50-50-v1-01 get-balance-fixed (as-contract tx-sender)) ERR-GET-BALANCE-FIXED-FAIL))
      (sender-balance (unwrap! (get-balance-fixed sender) ERR-GET-BALANCE-FIXED-FAIL))
      (reduce-supply (mul-down percent sender-balance))
      (reduce-principal-balance (div-down (mul-down principal-balance reduce-supply) (var-get total-supply)))
      (reduce-alex-balance (div-down (mul-down alex-balance reduce-supply) (var-get total-supply)))
      (new-total-supply (- (var-get total-supply) reduce-supply))
    )    
    (asserts! (>= block-height (var-get start-block)) ERR-NOT-ACTIVATED)
    (asserts! (and (<= percent ONE_8) (> percent u0)) ERR-INVALID-PERCENT)
    ;; only if beyond end-cycle and no staking positions
    (asserts! 
      (and 
        (> current-cycle (var-get end-cycle))
        (is-eq u0 (get amount-staked (as-contract (get-staker-at-cycle current-cycle))))
        (is-eq u0 (get amount-staked (as-contract (get-alex-staker-at-cycle current-cycle)))) 
      )  
      ERR-REWARD-CYCLE-NOT-COMPLETED
    )
    ;; transfer relevant balance to sender
    (as-contract (try! (contract-call? .age000-governance-token transfer-fixed reduce-alex-balance tx-sender sender none)))
    (as-contract (try! (contract-call? .fwp-wstx-alex-50-50-v1-01 transfer-fixed reduce-principal-balance tx-sender sender none)))
    
    ;; burn pool token
    (var-set total-supply new-total-supply)
	  (try! (ft-burn? auto-fwp-wstx-alex-120 (fixed-to-decimals reduce-supply) sender))
    (print { object: "pool", action: "position-removed", data: { reduce-supply: reduce-supply, total-supply: new-total-supply }})
    (ok { principal: reduce-principal-balance, rewards: reduce-alex-balance })
  ) 
)

(define-private (mul-down (a uint) (b uint))
    (/ (* a b) ONE_8)
)

(define-private (div-down (a uint) (b uint))
  (if (is-eq a u0)
    u0
    (/ (* a ONE_8) b)
  )
)

;; contract initialisation
;; (set-contract-owner .executor-dao)
;; (contract-call? .alex-vault add-approved-token .auto-fwp-wstx-alex-120)