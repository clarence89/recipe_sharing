<template>
    <button class="btn" onclick="my_modal_1.showModal()">Add recipe</button>
    <dialog id="my_modal_1" class="modal">
        <div class="modal-box">
            <fieldset class="fieldset p-4">
                <legend class="fieldset-legend">Page details</legend>

                <label class="label">Title</label>
                <input type="text" class="input" placeholder="My awesome page" />

                <label class="label">Slug</label>
                <input type="text" class="input" placeholder="my-awesome-page" />

                <label class="label">Author</label>
                <input type="text" class="input" placeholder="Name" />
            </fieldset>
            <div class="modal-action">
                <form method="dialog">
                    <button class="btn">Close</button>
                </form>
            </div>
        </div>
    </dialog>
</template>
<script>

</script>