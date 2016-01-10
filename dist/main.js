function randomSpawn()
{
    var spawns = Object.keys(Game.spawns);
    return Game.spawns[spawns[Math.random() * spawns.length << 0]];
}

function randomSource(room)
{
    var sources = room.find(FIND_SOURCES);
    return sources[Math.random() * sources.length << 0];
}

Creep.prototype.tickHarvester = function()
{
    if (this.carry.energy >= this.carryCapacity)
    {
        if (this.memory.spawnGoal == undefined)
        {
            this.memory.spawnGoal = randomSpawn().pos;
        }
        else
        {
            var spawn = this.room.lookForAt('structure', this.memory.spawnGoal.x, this.memory.spawnGoal.y)[0];
            this.moveTo(spawn);

            if (this.transfer(spawn, RESOURCE_ENERGY) == ERR_FULL)
            {
                if (this.room.storage != undefined)
                    this.memory.spawnGoal = this.room.storage.pos;
                else
                    this.memory.spawnGoal = randomSpawn().pos;
            }
        }
    }
    else
    {
        if (this.memory.sourceGoal == undefined)
        {
            this.memory.sourceGoal = randomSource(this.room).pos;
        }
        else
        {
            var source = this.room.lookForAt('source', this.memory.sourceGoal.x, this.memory.sourceGoal.y)[0];
            this.moveTo(source);
            this.harvest(source);
        }
    }
}

Creep.prototype.tickGuard = function()
{
    var closest = Game.spawns.Spawn1.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (closest == null || closest.owner.username == 'Source Keeper')
    {
        this.moveTo(Game.spawns.Spawn1)
    }
    else
    {
        this.moveTo(closest);
        this.attack(closest);
    }
}

Creep.prototype.tick = function()
{
    switch (this.memory.role)
    {
    case 'harvester':
        this.tickHarvester();
        break;

    case 'guard':
        this.tickGuard();
        break;
    }
}

Spawn.prototype.create = function(creepType)
{
    switch (creepType)
    {
    case 'harvester':
        return this.createCreep([WORK, CARRY, MOVE], undefined, {'role': 'harvester'});

    case 'guard':
        return this.createCreep([ATTACK, TOUGH, MOVE, MOVE], undefined, {'role': 'guard'});
    }
}

Spawn.prototype.spawnQueue = [
    'harvester',
    'guard',
    'harvester',
    'guard'
]


module.exports.loop = function () {
    if (Object.keys(Game.creeps).length == 0)
    {
        var spawn = randomSpawn();
        console.log('Spawning a ' + spawn.spawnQueue[0]);
        spawn.create(spawn.spawnQueue[0]);
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        creep.tick();
    }
}


