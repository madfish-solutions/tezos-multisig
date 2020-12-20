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

type operator_info is record [
  maanger     : address;
  allowed     : bool;
]

type proposal_info is record [
  actions     : unit -> list(operation);
  expired     : nat;
  approve     : bool;
]

type return is list (operation) * storage

type action is
| Control of operator_info
| Propose of proposal_info
| Default of unit
| Approve of nat
| Execute of nat
| Require of nat

const max_duration : nat = 15552000n;
const min_duration : nat = 3600n;

function propose (const action : proposal_info ; const s : storage) : storage is
  block {
    if Set.mem(Tezos.sender, s.managers) then skip
    else failwith("Multisig/not-permitted");
    if action.expired < max_duration and action.expired > min_duration then skip
    else failwith("Multisig/wrong-duration");
    s.pendings[s.id_count] := record [
      actions = action.actions;
      expired = Tezos.now + int(action.expired);
      approve = if action.approve then set[Tezos.sender]
        else (set[] : set(address));
    ];
    s.id_count := s.id_count + 1n;
  } with (s)

function approve (const proposal_id : nat ; const s : storage) : storage is
  block {
    if Set.mem(Tezos.sender, s.managers) then skip
    else failwith("Multisig/not-permitted");
    case s.pendings[proposal_id] of
    | None -> failwith("Multisig/no-proposal")
    | Some(proposal) -> {
      if proposal.expired < Tezos.now then remove proposal_id from map s.pendings
      else block {
        proposal.approve := Set.add(Tezos.sender, proposal.approve);
        s.pendings[proposal_id] := proposal;
      };
    }
    end;
  } with (s)

function execute (const proposal_id : nat ; const s : storage) : return is
  block {
    if Set.mem(Tezos.sender, s.managers) then skip
    else failwith("Multisig/not-permitted");
    const operations : list(operation) = (list [] : list(operation));
    case s.pendings[proposal_id] of
    | None -> failwith("Multisig/no-proposal")
    | Some(proposal) -> {
      if proposal.expired < Tezos.now then skip
      else block {
        if Set.size(proposal.approve) < s.required then failwith("Multisig/not-approved") 
        else skip;
        operations := proposal.actions(Unit);
      };
      remove proposal_id from map s.pendings;
    }
    end;
  } with (operations, s)

function control (const action : operator_info; const s : storage) : storage is
  block {
    if Tezos.sender = Tezos.self_address then skip
    else failwith("Multisig/not-permitted");
    s.managers := if action.allowed then Set.add(action.maanger, s.managers)
    else Set.remove(action.maanger, s.managers);
  } with s

function require (const new_required : nat; const s : storage) : storage is
  block {
    if Tezos.sender = Tezos.self_address then skip
    else failwith("Multisig/not-permitted");
    s.required := new_required;
  } with s

function main (const action : action; const s : storage) : return is
  case action of
    | Control(params) -> ((nil : list(operation)), control(params, s))
    | Propose(params) -> ((nil : list(operation)), propose(params, s))
    | Approve(params) -> ((nil : list(operation)), approve(params, s))
    | Require(params) -> ((nil : list(operation)), require(params, s))
    | Default(params) -> ((nil : list(operation)), s)
    | Execute(params) -> (execute(params, s))
  end