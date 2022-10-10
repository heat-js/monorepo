
import { page } from '$app/stores';
import { navigating } from '$app/stores';
import { writable, derived } from 'svelte/store';

export const activeModal = writable(null);

const url = derived([navigating, page], ([$navigating, $page], set) => {
	set($navigating ? $navigating.from.url : $page.url);
})

export const modalProps = derived([url, activeModal], ([$url, $activeModal], set) => {
	const props = {};
	$url.searchParams.forEach((value, key) => {
		if (key !== 'modal') {
			props[key] = value;
		}
	});

	if ($activeModal && $activeModal.props) {
		Object.assign(props, $activeModal.props);
	}

	set(props);
});

export const modalId = derived([url, activeModal], ([$url, $activeModal], set) => {
	set($activeModal ? $activeModal.id : $url.searchParams.get('modal'));
});


// $: url = $navigating ? $navigating.from : $page.url;

// $: {
// 	modalProps = {};
// 	url.searchParams.forEach((value, key) => {
// 		if (key !== 'modal') {
// 			modalProps[key] = value;
// 		}
// 	});
// 	if ($activeModal && $activeModal.props) {
// 		Object.assign(modalProps, $activeModal.props);
// 	}
// }

// $: id = $activeModal ? $activeModal.id : url.searchParams.get('modal');
