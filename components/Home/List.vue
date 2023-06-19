<template>
    <ul>
        <li v-for="post in posts">
            <img
                class="thumb"
                :src="post?.media?.formats?.thumb?.url ?? 'https://placehold.co/600?text=No+media+found&font=roboto'"
                :alt="post?.media?.alt"
            />
            <div class="info">
                <span class="title">{{ post.title }}</span>
                <div v-if="post.summary" class="excerpt-wrapper">
                    <span class="excerpt">{{ post.summary }}</span>
                </div>
            </div>
            <NuxtLink :to="post.permalink" />
        </li>
    </ul>
</template>

<script>
export default {
    props: {
        posts: Array
    }
}
</script>
