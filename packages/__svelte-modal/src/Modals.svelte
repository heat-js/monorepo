<script>
	import modals from "../../../modals";
	import { sineInOut } from "svelte/easing";
	import { closeModal } from "$services/modal";
	import { modalId, modalProps } from "$stores/modal";
	import Scroll from "../Scroll/Scroll.svelte";
	import Overlay from "../Layout/Overlay.svelte";
	import DiceLoader from "../Icon/DiceLoader.svelte";
	import { browser } from "$app/environment";
	import { loadTranslations } from "$translations";

	let internalId;
	let element;
	let elementProps;
	let loading = false;

	const loadModal = async (id, props) => {
		const module = await modals[id]();

		if (module.load) {
			await module.load(props);
		}

		return module;
	};

	const prepareModal = async (id, props) => {
		if (!browser) return;

		if (!(id in modals)) {
			internalId = undefined;
			element = undefined;
			return;
		}

		if (internalId === id) {
			return;
		}

		internalId = id;
		loading = true;

		let module;

		try {
			const [mod] = await Promise.all([
				loadModal(id, props),
				loadTranslations({ modal: id }),
			]);
			module = mod;
		} catch (error) {
			throw error;
		} finally {
			if (id === $modalId && module) {
				loading = false;
				element = module.default;
				elementProps = props;
			}
		}
	};

	$: prepareModal($modalId, $modalProps);

	function modalAnimation(_, { duration }) {
		return {
			duration,
			css: (t) => {
				const eased = sineInOut(t);

				return `
					transform: scale(${eased * 0.2 + 0.8});
					opacity: ${eased};
				;`;
			},
		};
	}
</script>

<div id="modal-container">
	{#if $modalId}
		<slot name="backdrop" />
	{/if}

	{#if $modalId && loading}
		<slot name="loader" />
	{/if}

	{#if $modalId && element && elementProps}
		<div
			class="container"
			transition:modalAnimation|local={{ duration: 200 }}
		>
			<Scroll absolute center>
				<div class="hitbox" on:click={closeModal} />
				<div class="modal modal-{$modalId}">
					<svelte:component this={element} {...elementProps} />
				</div>
			</Scroll>
		</div>
	{/if}
</div>

<style lang="stylus">

	.loader
		position absolute
		top 0
		left 0
		right 0
		bottom 0
		z-index 201

		display flex
		align-items center
		justify-content center

		--cube-color var(--text-color-4)

	.container
		position absolute
		top 0
		left 0
		right 0
		bottom 0
		z-index 202
		// pointer-events none

	.hitbox
		position absolute
		top 0
		left 0
		right 0
		bottom 0
		z-index 1

	.modal
		position relative
		z-index 2
		// transform translateZ(100px)

		margin 10px
		// margin-left @css{ max(env(safe-area-inset-left), 10px) }
		// margin-right @css{ max(env(safe-area-inset-right), 10px) }

		display grid

		&:global(> *)
			grid-area 1 / 1
			align-self center
			justify-self center

			pointer-events all

</style>
