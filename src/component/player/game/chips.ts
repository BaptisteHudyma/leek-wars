import { Cell } from '@/component/player/game/cell'
import { Entity } from '@/component/player/game/entity'
import { Colors, Game } from "@/component/player/game/game"
import { Sound } from '@/component/player/game/sound'
import { Texture } from '@/component/player/game/texture'
import { Area } from '@/model/area'
import { Position } from './position'

abstract class ChipAnimation {
	public game: Game
	public done: boolean = false
	public willFinish: boolean = false
	public sound: Sound | null
	public cell!: Cell
	public targets: Entity[] | undefined
	public duration: number
	public position!: Position
	public launcher!: Entity | undefined
	constructor(game: Game, sound: Sound | null, duration: number) {
		this.game = game
		this.sound = sound
		this.duration = duration
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell, launcher?: Entity) {
		this.cell = targetCell
		this.targets = targets
		this.position = position
		this.launcher = launcher
		if (this.sound) {
			this.sound.play()
		}
	}
	public update(dt: number) {
		this.duration -= dt
		if (this.duration <= 0) {
			this.done = true
		}
	}
	public createChipAureol(targets: Entity[], texture: Texture) {
		for (const target of targets) {
			const x = target.ox
			const y = target.oy
			const z = target.getHeight() + 20
			this.game.particles.addImage(x, y, z, 0, 0, -0.6, 0, texture, 60)
		}
	}
	public createChipImage(targets: Entity[], texture: Texture) {
		for (const target of targets) {
			const x = target.ox
			const y = target.oy
			const z = target.getHeight() + 40
			this.game.particles.addImage(x, y, z, 0, 0, 0.2, 0, texture, 70)
		}
	}
	public createChipHaloEntity(target: Entity) {
		const dx = Math.random() * 100 - 50
		const x = target.ox + dx
		const y = target.oy + Math.random() * 30 - 15
		const z = Math.random() * 10
		const speed = 1.5 + (50 - Math.abs(dx)) / 50
		const life = 80 - Math.abs(dx)
		this.game.particles.addImage(x, y, z, 0, 0, speed, 0, this.game.T.halo, life)
	}
	public createChipHalo(targets: Entity[]) {
		for (const target of targets) {
			this.createChipHaloEntity(target)
		}
	}
	public createChipHealEntity(target: Entity) {
		const dx = Math.random() * 100 - 50
		const x = target.ox + dx
		const y = target.oy + Math.random() * 30 - 15
		const z = Math.random() * 10
		const speed = 1.5 + (50 - Math.abs(dx)) / 50
		const life = 80 - Math.abs(dx)
		this.game.particles.addImage(x, y, z, 0, 0, speed, 0, this.game.T.heal_cross, life)
	}
	public createChipHeal(targets: Entity[]) {
		for (const target of targets) {
			this.createChipHealEntity(target)
		}
	}
}

class ChipShieldAnimation extends ChipAnimation {
	public texture: Texture
	constructor(game: Game, texture: Texture) {
		super(game, game.S.shield, 60)
		this.texture = texture
	}
	public launch(launchCell: Cell, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchCell, targetPos, targets, targetCell)
		this.createChipImage(targets, this.texture)
		this.createChipAureol(targets, this.game.T.shield_aureol)
	}
}

class ChipBoostAnimation extends ChipAnimation {
	public texture: Texture
	public delay: number = 2
	public area: Area
	constructor(game: Game, texture: any, area: Area = Area.SINGLE_CELL) {
		super(game, game.S.buff, 60)
		this.texture = texture
		this.area = area
	}
	public launch(launchCell: Cell, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchCell, targetPos, targets, targetCell)
		this.createChipImage(targets, this.texture)
		this.createChipAureol(targets, this.game.T.buff_aureol)
		if (this.area !== Area.SINGLE_CELL) {
			this.game.setEffectArea(targetCell, this.area, 'blue')
		}
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			if (this.targets) {
				this.createChipHalo(this.targets)
			}
			this.delay = 2
		}
	}
}

class ChipHealAnimation extends ChipAnimation {
	public texture: Texture
	public delay: number = 2
	public area: Area
	constructor(game: Game, texture: any, area: Area = Area.SINGLE_CELL) {
		super(game, game.S.heal, 45)
		this.texture = texture
		this.area = area
	}
	public launch(launchCell: Cell, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchCell, targetPos, targets, targetCell)
		this.createChipImage(targets, this.texture)
		this.createChipAureol(targets, this.game.T.cure_aureol)
		if (this.area !== Area.SINGLE_CELL) {
			this.game.setEffectArea(targetCell, this.area, 'green')
		}
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			if (this.targets) {
				this.createChipHeal(this.targets)
			}
			this.delay = 2
		}
	}
}

class ChipDebuffAnimation extends ChipAnimation {
	public texture: Texture
	public area: Area
	constructor(game: Game, texture: any, area: Area = Area.SINGLE_CELL) {
		super(game, game.S.debuff, 60)
		this.texture = texture
		this.area = area
	}
	public launch(launchCell: Cell, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchCell, targetPos, targets, targetCell)
		this.createChipImage(targets, this.texture)
		this.createChipAureol(targets, this.game.T.shackle_aureol)
		if (this.area !== Area.SINGLE_CELL) {
			this.game.setEffectArea(targetCell, this.area, '#9f00ef')
		}
	}
}

class ChipPoisonAnimation extends ChipAnimation {
	public texture: Texture
	public area: Area
	constructor(game: Game, texture: any, area: Area = Area.SINGLE_CELL) {
		super(game, game.S.poison, 60)
		this.texture = texture
		this.area = area
	}
	public launch(launchCell: Cell, targetPos: Cell, targets: Entity[], targetCell: Cell) {
		super.launch(launchCell, targetPos, targets, targetCell)
		this.createChipImage(targets, this.texture)
		this.createChipAureol(targets, this.game.T.poison_aureol)
		if (this.area !== Area.SINGLE_CELL) {
			this.game.setEffectArea(targetCell, this.area, '#ea5ef9')
		}
	}
}

class ChipDamageReturnAnimation extends ChipAnimation {
	public texture: Texture
	public area: Area
	constructor(game: Game, texture: any, area: Area = Area.SINGLE_CELL) {
		super(game, game.S.buff, 60)
		this.texture = texture
		this.area = area
	}
	public launch(launchCell: Cell, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchCell, targetPos, targets, targetCell)
		this.createChipImage(targets, this.texture)
		this.createChipAureol(targets, this.game.T.damage_return_aureol)
		if (this.area !== Area.SINGLE_CELL) {
			this.game.setEffectArea(targetCell, this.area, Colors.AGILITY_COLOR)
		}
	}
}

class Adrenaline extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_adrenaline, Area.CIRCLE1) }
}
class Armor extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_armor) }
}
class Armoring extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_armoring) }
}
class Bandage extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_bandage) }
}
class Carapace extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_carapace) }
}
class Cure extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_cure) }
}
class DevilStrike extends ChipAnimation {
	public delay = 0
	public x!: number
	public y!: number
	constructor(game: Game) {
		super(game, game.S.fire, 100)
	}
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.x = targetPos.x
		this.y = targetPos.y
		this.game.setEffectArea(targetCell, Area.CIRCLE3, 'red', 180)
		this.game.particles.addImage(this.x, this.y, 0, 0, 0, 0, 0, this.game.T.red_circle, 120, 0.6, 0, true)
		this.game.particles.addImage(this.x, this.y, 50, 0, 0, 1.2, 0, this.game.T.daemon_shadow, 100, 0.9)
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 12
			const x = Math.random() * 250 - 125
			const y = Math.random() * 125 - 62.5
			this.game.particles.addLaser(this.x + x, this.y + y, 230, Math.PI / 2, 500, this.game.T.m_laser_bullet, null)
			this.game.S.rock.play()
		}
	}
}
class Doping extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_doping) }
}
class Drip extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_drip, Area.CIRCLE2) }
}
class Flame extends ChipAnimation {
	public delay = 2
	constructor(game: Game) { super(game, game.S.fire, 70) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		for (const target of targets) {
			target.burnAnim(100)
		}
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 12
			if (this.targets) {
				for (const target of this.targets) {
					const z = 20 + Math.random() * 30
					const dx = Math.random() * 8 - 4
					const dy = Math.random() * 8 - 4
					const x = Math.random() * 40 - 20
					const y = Math.random() * 40 - 20
					target.hurt(target.ox + x, target.oy + y, z, dx, dy, 0)
				}
			}
		}
	}
}
class Flash extends ChipAnimation {
	public delay = 1
	constructor(game: Game) { super(game, game.S.lightning, 70) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.game.particles.addImage(targetPos.x - 50, targetPos.y, 220, 0.5, 0, 0, 0, this.game.T.grey_cloud, 80)
		this.game.particles.addImage(targetPos.x + 50, targetPos.y, 220, -0.5, 0, 0, 0, this.game.T.grey_cloud, 80)
		this.game.particles.addImage(targetPos.x + 10, targetPos.y, 230, 0.2, 0, 0, 0, this.game.T.grey_cloud, 80)
		this.game.particles.addImage(targetPos.x - 10, targetPos.y, 230, -0.2, 0, 0, 0, this.game.T.grey_cloud, 80)
		this.game.setEffectArea(targetCell, Area.CIRCLE1, 'red')
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 1
			const da = Math.random() * Math.PI / 20 - Math.PI / 40
			const dx = Math.random() * 60 - 30
			const dy = Math.random() * 4 - 2
			this.game.particles.addLightning(this.position.x + dx, this.position.y - 200 + dy, 0, Math.PI / 2 + da, this.position, this.game.T.purple_lightning)
			if (this.targets) {
				for (const target of this.targets) {
					target.electrify()
				}
			}
		}
	}
}
class Fortress extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_fortress) }
}
class Helmet extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_helmet) }
}
class Ice extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.ice, 30) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.game.particles.addGarbage(targetPos.x, targetPos.y, 100, 0, 0, 1.5, this.game.T.ice_small, 1, 0)
	}
}
class Iceberg extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.ice, 40) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		this.game.particles.addGarbage(targetPos.x, targetPos.y, 180, 0, 0, 3, this.game.T.iceberg, 1, 0)
		this.game.setEffectArea(targetCell, Area.CIRCLE2, 'white')
	}
}
class Inversion extends ChipAnimation {
	public inverted = false
	public launchPos!: Position
	public target: any
	constructor(game: Game) {
		super(game, game.S.teleportation, 120)
	}
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell, launcher: Entity) {
		super.launch(launchPos, targetPos, targets, targetCell, launcher)
		this.target = targets[0]
		this.launchPos = launchPos
	}
	public update(dt: number) {
		super.update(dt)
		if (Math.random() > 0.8 && this.duration > 40) {
			const xx = Math.random() * 60 - 30
			const x1 = this.launchPos.x + xx
			const y1 = this.launchPos.y
			const x2 = this.position.x + xx
			const y2 = this.position.y
			const z = 0
			const dz = 1.7
			const dx = 0
			const dy = 0
			const angle = 0
			const sx = 10
			const sy = 10
			const dsx = 0
			const dsy = 0.6
			const color = ['#f00', '#0f0', '#00f', '#ff0'][Math.floor(Math.random() * 4)]
			const life = 50
			const alpha = 0.4
			this.game.particles.addRectangle(x1, y1, z, dx, dy, dz, angle, sx, sy, dsx, dsy, color, alpha, life)
			this.game.particles.addRectangle(x2, y2, z, dx, dy, dz, angle, sx, sy, dsx, dsy, color, alpha, life)
		}
		if (!this.inverted && this.duration < 40 && this.launcher) {
			const cell = this.launcher.cell
			this.launcher.setCell(this.target.cell)
			this.target.setCell(cell)
			this.inverted = true
		}
	}
}
class LeatherBoots extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_leather_boots) }
}
class Liberation extends ChipAnimation {
	public delay = 2
	constructor(game: Game) {
		super(game, game.S.liberation, 60)
	}
	public update(dt: number) {
		super.update(dt)
		if (!this.targets) { return  }
		if (Math.random() > 0.5) {
			const t = this.targets[0]
			let angle = Math.random() * Math.PI * 2
			const dx = Math.cos(angle) * 2
			const dy = Math.sin(angle)
			angle = Math.atan2(dy, dx)
			const x = t.ox + dx * 10
			const y = t.oy + dy * 10
			const z = 50
			this.game.particles.addImage(x, y, z, dx, dy, 0, angle, this.game.T.liberation_halo, 60)
		}
	}
}
class Lightning extends ChipAnimation {
	public delay = 1
	constructor(game: Game) {
		super(game, game.S.lightning, 80)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.targets = targets
		this.game.particles.addImage(this.position.x - 50, this.position.y, 230, 0.5, 0, 0, 0, this.game.T.black_cloud, 90)
		this.game.particles.addImage(this.position.x + 50, this.position.y, 230, -0.5, 0, 0, 0, this.game.T.black_cloud, 90)
		this.game.particles.addImage(this.position.x + 10, this.position.y, 240, 0.2, 0, 0, 0, this.game.T.black_cloud, 90)
		this.game.particles.addImage(this.position.x - 10, this.position.y, 240, -0.2, 0, 0, 0, this.game.T.black_cloud, 90)
		this.game.setEffectArea(targetCell, Area.CIRCLE2, 'red')
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 1
			const da = Math.random() * Math.PI / 20 - Math.PI / 40
			const dx = Math.random() * 80 - 40
			const dy = Math.random() * 4 - 2
			this.game.particles.addLightning(this.position.x + dx, this.position.y - 200 + dy, 0, Math.PI / 2 + da, this.position, this.game.T.red_lightning)
			if (this.targets) {
				for (const target of this.targets) {
					target.electrify()
				}
			}
		}
	}
}
class Meteorite extends ChipAnimation {
	public willFinish = false
	public count = 6
	public delay = 0
	public vx: number = 0
	constructor(game: Game) {
		super(game, game.S.meteorite, 100)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.vx = (500 + Math.random() * 300) * ((Math.random() > 0.5) ? 1 : -1)
		this.game.setEffectArea(targetCell, Area.CIRCLE2, '#f26304', 180)
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay < 0) {
			this.delay = 5 + Math.random() * 15
			this.count--
			if (this.count > 0) {
				const y = this.position.y
				const z = this.position.y + 200
				const x = this.position.x + this.vx
				const angle = Math.atan2(this.vx, z) + Math.PI / 2
				const ox = Math.random() * 120 - 60
				const oy = Math.random() * 120 - 60
				const size = 0.7 + Math.random() * 0.5
				this.game.particles.addMeteorite(x + ox, y + oy, z, angle, size, this.targets, this.count === 1)
			} else {
				this.willFinish = true
			}
		}
	}
}
class Motivation extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_motivation) }
}
class Pebble extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.rock, 30) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.game.particles.addGarbage(targetPos.x, targetPos.y, 100, 0, 0, 2, this.game.T.pebble_small, 1, 0)
	}
}
class Protein extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_protein) }
}
class Rage extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_rage) }
}
class Rampart extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_rampart) }
}
class Reflexes extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_reflexes) }
}
class Regeneration extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_regeneration) }
}
class Remission extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_remission) }
}
class Rock extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.rock, 40) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.game.particles.addGarbage(targetPos.x, targetPos.y, 150, 0, 0, 2, this.game.T.rock, 1, 0)
	}
}
class Rockfall extends ChipAnimation {
	public delay = 0
	constructor(game: Game) { super(game, game.S.rockfall, 70) }
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.game.setEffectArea(targetCell, Area.CIRCLE2, '#c5c2c6', 100)
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 10
			const x = Math.random() * 100 - 50
			const y = Math.random() * 100 - 50
			const z = 120 + Math.random() * 100
			const dz = -1 - Math.random() * 3
			const scale = 0.3 + Math.random() * 0.5
			this.game.particles.addGarbage(this.position.x + x, this.position.y + y, z, 0, 0, dz, this.game.T.rock, 1, 0, scale)
		}
	}
}
class SevenLeagueBoots extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_reflexes) }
}
class Shield extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_shield) }
}
class Shock extends ChipAnimation {
	public delay = 2
	constructor(game: Game) { super(game, game.S.lightning, 60) }
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.game.particles.addImage(this.position.x - 50, this.position.y, 220, 0.5, 0, 0, 0, this.game.T.cloud, 70)
		this.game.particles.addImage(this.position.x + 50, this.position.y, 220, -0.5, 0, 0, 0, this.game.T.cloud, 70)
		this.game.particles.addImage(this.position.x + 10, this.position.y, 230, 0.2, 0, 0, 0, this.game.T.cloud, 70)
		this.game.particles.addImage(this.position.x - 10, this.position.y, 230, -0.2, 0, 0, 0, this.game.T.cloud, 70)
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 2
			const da = Math.random() * Math.PI / 20 - Math.PI / 40
			const dx = Math.random() * 60 - 30
			const dy = Math.random() * 4 - 2
			this.game.particles.addLightning(this.position.x + dx, this.position.y - 200 + dy, 0, Math.PI / 2 + da, this.position, this.game.T.lightning)
			if (this.targets) {
				for (const target of this.targets) {
					target.electrify()
				}
			}
		}
	}
}
class Spark extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.fire, 40) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		for (const target of targets) {
			target.burnAnim(50)
		}
	}
}
class Stalactite extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.ice, 40) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.game.particles.addGarbage(targetPos.x, targetPos.y, 180, 0, 0, 3, this.game.T.stalactite, 1, 0)
	}
}
class Steroid extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_steroid) }
}
class Stretching extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_stretching) }
}
class Teleportation extends ChipAnimation {
	public teleported = false
	public cell!: Cell
	public launchPos!: Position
	public targetPos: any
	public target!: Entity
	constructor(game: Game) {
		super(game, game.S.teleportation, 140)
	}
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.cell = targetCell
		this.target = targets[0]
		this.launchPos = launchPos
		this.targetPos = targetPos
	}
	public update(dt: number) {
		super.update(dt)
		if (Math.random() > 0.6) {
			const xx = Math.random() * 60 - 30
			const yy = Math.random() * 30 - 15
			const x1 = this.launchPos.x + xx
			const y1 = this.launchPos.y + yy
			const x2 = this.targetPos.x + xx
			const y2 = this.targetPos.y + yy
			const z = 0
			const dz = 1.7
			const dx = 0
			const dy = 0
			const angle = 0
			const sx = 10
			const sy = 10
			const dsx = 0
			const dsy = 0.5
			const color = ['#f00', '#0f0', '#00f', '#ff0'][Math.floor(Math.random() * 4)]
			const life = 50
			const alpha = 0.4
			if (this.duration > 70) {
				this.game.particles.addRectangle(x1, y1, z, dx, dy, dz, angle, sx, sy, dsx, dsy, color, alpha, life)
			}
			if (this.duration < 100) {
				this.game.particles.addRectangle(x2, y2, z, dx, dy, dz, angle, sx, sy, dsx, dsy, color, alpha, life)
			}
		}
		if (!this.teleported && this.duration < 50) {
			this.target.setCell(this.cell)
			this.teleported = true
		}
	}
}
class Vaccine extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_vaccine) }
}
class Wall extends ChipShieldAnimation {
	constructor(game: Game) { super(game, game.T.chip_wall)	}
}
class WarmUp extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_warm_up) }
}
class WingedBoots extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_winged_boots, Area.CIRCLE1) }
}
class Whip extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_whip) }
}
class Acceleration extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_acceleration) }
}
class Loam extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_loam) }
}
class Fertilizer extends ChipHealAnimation {
	constructor(game: Game) { super(game, game.T.chip_fertilizer) }
}
class SlowDown extends ChipDebuffAnimation {
	constructor(game: Game) { super(game, game.T.chip_slow_down) }
}
class BallAndChain extends ChipDebuffAnimation {
	constructor(game: Game) { super(game, game.T.chip_ball_and_chain, Area.CIRCLE2) }
}
class Tranquilizer extends ChipDebuffAnimation {
	constructor(game: Game) { super(game, game.T.chip_tranquilizer) }
}
class Soporific extends ChipDebuffAnimation {
	constructor(game: Game) { super(game, game.T.chip_soporific, Area.CIRCLE3) }
}
class Fracture extends ChipDebuffAnimation {
	constructor(game: Game) { super(game, game.T.chip_fracture) }
}
class Solidification extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_solidification) }
}
class Venom extends ChipPoisonAnimation {
	constructor(game: Game) { super(game, game.T.chip_venom) }
}
class Toxin extends ChipPoisonAnimation {
	constructor(game: Game) { super(game, game.T.chip_toxin, Area.CIRCLE2) }
}
class Plague extends ChipPoisonAnimation {
	constructor(game: Game) { super(game, game.T.chip_plague, Area.CIRCLE3) }
}
class Thorn extends ChipDamageReturnAnimation {
	constructor(game: Game) { super(game, game.T.chip_thorn, Area.CIRCLE2) }
}
class Mirror extends ChipDamageReturnAnimation {
	constructor(game: Game) { super(game, game.T.chip_mirror, Area.CIRCLE2) }
}
class Ferocity extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_ferocity) }
}
class Collar extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_collar) }
}
class Bark extends ChipBoostAnimation {
	constructor(game: Game) { super(game, game.T.chip_bark) }
}
class Burning extends ChipAnimation {
	constructor(game: Game) { super(game, game.S.fire, 60) }
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.createChipImage(targets, this.game.T.chip_burning)
		this.game.setEffectArea(targetCell, Area.CIRCLE3, 'red')
	}
}
class Antidote extends ChipAnimation {
	public delay = 2
	constructor(game: Game) { super(game, game.S.liberation, 60) }
	public update(dt: number) {
		super.update(dt)
		if (!this.targets) { return  }
		if (Math.random() > 0.5) {
			const t = this.targets[0]
			let angle = Math.random() * Math.PI * 2
			const dx = Math.cos(angle) * 2
			const dy = Math.sin(angle)
			angle = Math.atan2(dy, dx)
			const x = t.ox + dx * 10
			const y = t.oy + dy * 10
			const z = 50
			this.game.particles.addImage(x, y, z, dx, dy, 0, angle, this.game.T.antidote_halo, 60)
		}
	}
}
class Punishment extends ChipAnimation {
	public soundPlayed = false
	constructor(game: Game) {
		super(game, null, 35)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.targets = targets
		const s = 40
		const d = 60
		const l = 40
		this.game.particles.addSpike(this.position.x - d, this.position.y + d / 2, 40,  s, -s / 2, this.game.T.spike1, l, false)
		this.game.particles.addSpike(this.position.x - d, this.position.y - d / 2, 46,  s,  s / 2, this.game.T.spike2, l, false)
		this.game.particles.addSpike(this.position.x + d, this.position.y + d / 2, 40, -s, -s / 2, this.game.T.spike1, l, true)
		this.game.particles.addSpike(this.position.x + d, this.position.y - d / 2, 46, -s,  s / 2, this.game.T.spike2, l, true)
	}
	public update(dt: number) {
		super.update(dt)
		if (this.duration < 7 && !this.soundPlayed) {
			this.game.S.sword.play()
			this.soundPlayed = true
		}
	}
}
class StealChipAnimation extends ChipAnimation {
	delta: number = 0
	caster!: Entity
	spinningTexture!: Texture
	halo: Function
	constructor(game: Game, sound: Sound, spinningTexture: Texture, halo: Function) {
		super(game, sound, 110)
		this.spinningTexture = spinningTexture
		this.halo = halo
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell, caster: Entity) {
		super.launch(launchPos, position, targets, targetCell)
		this.caster = caster
	}
	public update(dt: number) {
		super.update(dt)
		this.delta += dt
		if (this.delta > 3 && this.duration > 60) {
			for (const target of this.targets!) {
				if (target === this.caster) {
					this.halo(target)
				} else {
					this.game.particles.addSpinningParticle(target.ox, target.oy, Math.PI / 2, this.spinningTexture)
				}
			}
			this.delta = 0
		}
	}
}
class Precipitation extends StealChipAnimation {
	constructor(game: Game) {
		super(game, game.S.buff, game.T.halo, ChipAnimation.prototype.createChipHaloEntity)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell, caster: Entity) {
		super.launch(launchPos, position, targets, targetCell, caster)
		this.game.setEffectArea(targetCell, Area.X_2, '#0280db')
		this.createChipImage([caster], this.game.T.chip_precipitation)
		this.createChipAureol([caster], this.game.T.buff_aureol)
	}
}
class Covetousness extends StealChipAnimation {
	constructor(game: Game) {
		super(game, game.S.buff, game.T.halo, ChipAnimation.prototype.createChipHaloEntity)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell, caster: Entity) {
		super.launch(launchPos, position, targets, targetCell, caster)
		this.game.setEffectArea(targetCell, Area.X_2, '#0280db')
		this.createChipImage([caster], this.game.T.chip_covetousness)
		this.createChipAureol([caster], this.game.T.buff_aureol)
	}
}
class Vampirization extends StealChipAnimation {
	constructor(game: Game) {
		super(game, game.S.heal, game.T.halo_green, ChipAnimation.prototype.createChipHealEntity)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell, caster: Entity) {
		super.launch(launchPos, position, targets, targetCell, caster)
		this.game.setEffectArea(targetCell, Area.PLUS_3, '#5efe36')
		this.createChipImage([caster], this.game.T.chip_vampirization)
		this.createChipAureol([caster], this.game.T.heal_cross)
	}
}
class Plasma extends ChipAnimation {
	static DURATION = 120
	public delay: number = 0
	constructor(game: Game) {
		super(game, null, Plasma.DURATION)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.targets = targets
		this.game.particles.addPlasma(position.x, position.y, 20, this.game.T.plasma, Plasma.DURATION)
		this.game.setEffectArea(targetCell, Area.PLUS_2, '#2400ff', Plasma.DURATION)
		this.game.S.lightning.play()
		this.game.S.electrisor.play()
	}
	public update(dt: number) {
		super.update(dt)
		this.delay -= dt
		if (this.delay <= 0) {
			this.delay = 1
			if (this.targets) {
				for (const target of this.targets) {
					if (target.cell !== this.cell) {
						const angle = Math.atan2((target.oy - this.position.y + 20) / 2, target.ox - this.position.x)
						this.game.particles.addLightning(this.position.x, this.position.y, 20, angle, {x: target.ox, y: target.oy}, Math.random() > 0.5 ? this.game.T.purple_lightning : this.game.T.lightning, 25)
					}
					target.electrify()
				}
			}
		}
	}
}

class Alteration extends ChipAnimation {
	public delay = 2
	public directions: number[] = []
	constructor(game: Game) {
		super(game, game.S.alteration, 60)
	}
	public launch(launchPos: Position, position: Position, targets: Entity[], targetCell: Cell) {
		super.launch(launchPos, position, targets, targetCell)
		this.directions = []
		for (let i = 0; i < 10; ++i) {
			this.directions.push((2 * Math.PI * i) / 10 + (Math.random() * (Math.PI / 4)))
		}
	}
	public update(dt: number) {
		super.update(dt)
		if (!this.targets) { return  }
		this.delay -= dt
		if (this.delay < 0) {
			for (const direction of this.directions) {
				const t = this.targets[0]
				const dx = Math.cos(direction) * 2 * 1.3
				const dy = Math.sin(direction) * 1.3
				const angle = Math.atan2(dy, dx)
				const x = t.ox + dx * 5
				const y = t.oy + dy * 5
				const z = 50
				this.game.particles.addImage(x, y, z, dx, dy, 0, angle, this.game.T.alteration, 50)
			}
			this.delay = 4
		}
	}
}

class Jump extends ChipAnimation {
	public teleported = false
	public cell!: Cell
	public launchPos!: Position
	public targetPos: any
	public target!: Entity
	constructor(game: Game) {
		super(game, game.S.move, 70)
	}
	public launch(launchPos: Position, targetPos: Position, targets: Entity[], targetCell: Cell, caster: Entity) {
		super.launch(launchPos, targetPos, targets, targetCell)
		this.cell = targetCell
		this.target = targets[0]
		this.launchPos = launchPos
		this.targetPos = targetPos

		caster.jumpToCell(targetCell)
	}
	public update(dt: number) {
		this.duration -= dt
		if (this.duration <= 0) {
			this.willFinish = true
		}
	}
}

export { Alteration, ChipAnimation, Adrenaline, Armor, Acceleration, Antidote, Armoring, BallAndChain, Bandage, Bark, Burning, Carapace, Collar, Covetousness, Cure, DevilStrike, Doping, Drip, Ferocity, Fertilizer, Flame, Flash, Fortress, Fracture, Helmet, Ice, Iceberg, Inversion, Jump, LeatherBoots, Liberation, Lightning, Loam, Meteorite, Mirror, Motivation, Pebble, Plague, Plasma, Precipitation, Protein, Punishment, Rage, Rampart, Reflexes, Regeneration, Remission, Rock, Rockfall, SevenLeagueBoots, Shield, Shock, SlowDown, Solidification, Soporific, Spark, Stalactite, Steroid, Stretching, Teleportation, Thorn, Toxin, Tranquilizer, Vaccine, Vampirization, Venom, Wall, WarmUp, Whip, WingedBoots }
