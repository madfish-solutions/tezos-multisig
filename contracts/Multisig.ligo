type operator_info is record [
  allowed     : bool;
  manager     : address;
]

type proposal_info is record [
  actions     : unit -> list(operation);
  approve     : bool;
  expired     : nat;
]

type proposal is record [
  actions     : unit -> list(operation);
  expired     : timestamp;
  approve     : set(address);
]

type storage is record [
  pendings    : big_map(nat, proposal);
  managers    : set(address);
  id_count    : nat;
  required    : nat;
]

type return is list (operation) * storage

type action is
| Control of operator_info
| Propose of proposal_info
| Default of unit
| Approve of nat
| Execute of nat
| Require of nat

(* Proposals duration limits *)
const max_duration : nat = 15552000n;
const min_duration : nat = 3600n;

(* Initializes proposal *)
function propose (const action : proposal_info ; const s : storage) : storage is
  block {
    (* Check owner permissions *)
    if Set.mem(Tezos.sender, s.managers) then skip
    else failwith("Multisig/not-permitted");

    (* Ensure duration is in the safe range *)
    if action.expired <= max_duration and action.expired >= min_duration then skip
    else failwith("Multisig/wrong-duration");

    (* Add to proposals map *)
    s.pendings[s.id_count] := record [
      actions = action.actions;
      expired = Tezos.now + int(action.expired);
      approve = if action.approve then set[Tezos.sender]
        else (set[] : set(address));
    ];

    (* Update proposals total count *)
    s.id_count := s.id_count + 1n;
  } with (s)

(* Confirms proposal *)
function approve (const proposal_id : nat ; const s : storage) : storage is
  block {
    (* Check owner permissions *)
    if Set.mem(Tezos.sender, s.managers) then skip
    else failwith("Multisig/not-permitted");

    (* Check proposal exists *)
    case s.pendings[proposal_id] of
    | None -> failwith("Multisig/no-proposal")
    | Some(proposal) -> {
      (* Delete proposal if it is outdated *)
      if proposal.expired < Tezos.now then remove proposal_id from map s.pendings
      else block {
        (* Check if approved *)
        if Set.mem(Tezos.sender, proposal.approve) then failwith("Multisig/approved")
        else skip;
        (* Approve proposal otherwise *)
        proposal.approve := Set.add(Tezos.sender, proposal.approve);
        s.pendings[proposal_id] := proposal;
      };
    }
    end;
  } with (s)

(* Executes proposal *)
function execute (const proposal_id : nat ; const s : storage) : return is
  block {
    (* Check owner permissions *)
    if Set.mem(Tezos.sender, s.managers) then skip
    else failwith("Multisig/not-permitted");

    (* Prepare external operaitons *)
    const operations : list(operation) = (list [] : list(operation));

    (* Ensure proposal exists *)
    case s.pendings[proposal_id] of
    | None -> failwith("Multisig/no-proposal")
    | Some(proposal) -> {
      (* Ensure proposal isn't expired *)
      if proposal.expired < Tezos.now then skip
      else block {
        (* Ensure enough confirmations *)
        if Set.size(proposal.approve) < s.required then failwith("Multisig/not-approved") 
        else skip;

        (* Update operation list *)
        operations := proposal.actions(Unit);
      };

      (* Remove proposal *)
      remove proposal_id from map s.pendings;
    }
    end;
  } with (operations, s)

(* Sets status of the manager *)
function control (const action : operator_info; const s : storage) : storage is
  block {
    (* Ensure enough confirmations *)
    if Tezos.sender = Tezos.self_address then skip
    else failwith("Multisig/not-permitted");

    (* Set manager permissions *)
    s.managers := if action.allowed then Set.add(action.manager, s.managers)
    else Set.remove(action.manager, s.managers);
  } with s

(* Sets the number of required confirmations *)
function require (const new_required : nat; const s : storage) : storage is
  block {
    (* Ensure enough confirmations *)
    if Tezos.sender = Tezos.self_address then skip
    else failwith("Multisig/not-permitted");

    (* Ensure new_required is in range *)
    if new_required > 0n and new_required <= Set.size(s.managers) then skip
    else failwith("Multisig/invalid-require");

    (* Set required amount of confirmations *)
    s.required := new_required;
  } with s

(* Router *)
function main (const action : action; const s : storage) : return is
  case action of
    | Control(params) -> ((nil : list(operation)), control(params, s))
    | Propose(params) -> ((nil : list(operation)), propose(params, s))
    | Approve(params) -> ((nil : list(operation)), approve(params, s))
    | Require(params) -> ((nil : list(operation)), require(params, s))
    | Default(params) -> ((nil : list(operation)), s)
    | Execute(params) -> (execute(params, s))
  end