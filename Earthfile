VERSION 0.7 # https://docs.earthly.dev/docs/earthfile#version
FROM python:3

ARG --global build_dir="dist"


################
# Main targets #
################

# User-defined commands to run package-manager-agnostic installs
NODE_INSTALL_CI:
    COMMAND
    # This is from https://github.com/vercel/next.js/blob/84531c5301474f9e872ad6db5689a76fe82d7df4/examples/with-docker/Dockerfile#L9-L14
    # We look for the lockfile of each package managers and run the related command.
    # "CI" and "--frozen-lockfile" mean that the lockfile is not modified at all. To update dependencies, use the `+update` target.
    RUN if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
        elif [ -f package-lock.json ]; then npm ci; \
        elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
        else echo "Lockfile not found." && exit 1; \
        fi
NODE_INSTALL:
    COMMAND
    # same as above, except we don't use "ci" / "frozen lockfile" mode
    RUN if [ -f yarn.lock ]; then yarn; \
        elif [ -f package-lock.json ]; then npm install; \
        elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
        else echo "Lockfile not found." && exit 1; \
        fi



# Internal target that builds a base environment with dependencies.
node-base:
    FROM node:lts-alpine
    WORKDIR /workdir

    CACHE ./node_modules

    COPY package.json ./
    COPY --if-exists yarn.lock ./
    COPY --if-exists package-lock.json ./
    COPY --if-exists pnpm.lock ./

    DO +NODE_INSTALL_CI

    SAVE ARTIFACT node_modules


# Build the site
build:
    FROM +node-base
    WORKDIR /workdir

    COPY . .

    # Uncomment if you wish to disable nuxtjs telemetry. Learn more at https://nuxtjs.org/docs/configuration-glossary/configuration-telemetry/
    #ENV NUXT_TELEMETRY_DISABLED=1
    ENV NODE_OPTIONS="--max-old-space-size=8192"

    # assumes you have scripts in your package.json to run "next build" and "next export"
    RUN yarn run generate --fail-on-error

    SAVE ARTIFACT $build_dir build_result AS LOCAL $build_dir




##################
# Helper targets #
##################

# User-defined command to store the project metadata as artifacts
SAVE_DEPENDENCIES:
    COMMAND
    SAVE ARTIFACT node_modules AS LOCAL node_modules
    SAVE ARTIFACT package.json AS LOCAL package.json
    SAVE ARTIFACT --if-exists yarn.lock AS LOCAL yarn.lock
    SAVE ARTIFACT --if-exists package-lock.json AS LOCAL package-lock.json
    SAVE ARTIFACT --if-exists pnpm-lock.yaml AS LOCAL pnpm-lock.yaml


# Target that updates and saves dependencies. Run locally with `earthly +update`
update:
    FROM node:lts-alpine
    WORKDIR /workdir

    COPY package.json ./
    COPY --if-exists yarn.lock ./
    COPY --if-exists package-lock.json ./
    COPY --if-exists pnpm.lock ./

    DO +NODE_INSTALL
    DO +SAVE_DEPENDENCIES


# Target that executes an arbitrary command. Run locally with eg. `earthly +exec --push --command="yarn install ..."`
# NOTE: Only changes made to `package.json`, `node_modules` and the lockfiles will be saved!
exec:
    FROM +node-base
    ARG command
    WORKDIR /workdir

    COPY . .

    RUN $command
    DO +SAVE_DEPENDENCIES


# Target that starts a bash shell. Run locally with `earthly --push +shell`. Press ctrl+D or type `exit` to exit.
# You can use this for debugging or maintenance tasks, for example to run `yarn upgrade-interactive`.
# NOTE: Only changes made to `package.json`, `node_modules` and the lockfiles will be saved!
shell:
    FROM node:lts # We use lts here for convenience; `-alpine` is a bit too barebones for interactive use.
    ARG command
    WORKDIR /workdir

    COPY . .
    COPY +node-base/node_modules ./node_modules

    RUN echo 'echo ==================================================================' >> /etc/bash.bashrc
    RUN echo 'echo ==================================================================' >> /etc/bash.bashrc
    RUN echo 'echo This is a temporary interactive bash shell.' >> /etc/bash.bashrc
    RUN echo 'echo Press Ctrl+D or type \`exit\` to return to your shell.' >> /etc/bash.bashrc
    RUN echo 'echo To install packages, first run \`apt update\`.' >> /etc/bash.bashrc
    RUN echo 'echo Note that only package.json, lockfiles and node_modules are saved!' >> /etc/bash.bashrc
    RUN echo 'echo ==================================================================' >> /etc/bash.bashrc
    RUN echo 'echo ==================================================================' >> /etc/bash.bashrc
    RUN --interactive-keep bash
    DO +SAVE_DEPENDENCIES


# Run `nuxt dev` dev server with $PWD mounted. Run locally with `earthly +dev`.
# Note that if you exit Earthly (eg. via Ctrl+c), Earthly will immediately exit and leave the container running.
# You can manually stop it with `earthly +stop-dev` (or `docker stop earthly-dev-server`).
dev:
    ARG port=3000
    ARG container_name="earthly-dev-server"
    LOCALLY
        WITH DOCKER --load earthly-dev-server-image=+node-base
            RUN docker run --rm -i \
                        --volume="$PWD":/workdir:Z \
                        --env HOST=0.0.0.0 \
                        --publish $port:3000 \
                        --name="$container_name" \
                        earthly-dev-server-image \
                        yarn run dev
        END

stop-dev:
    ARG container_name="earthly-dev-server"

    LOCALLY
        RUN docker stop "$container_name"




################
# Swift upload #
################

# Base environment for Swift
swift-deps:
    FROM python:3
    RUN pip install python-keystoneclient python-swiftclient


# User-Defined Command to run Swift
SWIFT_UPLOAD:
    COMMAND
    ARG --required file_or_directory

    RUN --secret OS_USERNAME \
        --secret OS_PASSWORD \
        --secret OS_AUTH_URL \
        --secret OS_AUTH_VERSION \
        --secret OS_TENANT_NAME \
        --secret OS_STORAGE_URL \
        --secret OS_CONTAINER_NAME \
        --push \
        -- \
        swift upload --object-threads 5 --skip-identical --object-name "" $OS_CONTAINER_NAME ./$file_or_directory
        # NOTE: swift will send a `HEAD` request for every file! If there are a lot, OpenStack might start throwing `429 Too Many Requests`.
        # --skip-identical compares filesize and Etag (md5 hash). We can get both using `swift list --json`. We might want to implement a
        # custom "bulk upload" that would first list everything, then upload?


SWIFT_DELETE_BUCKET_FILES_NOT_PRESENT_LOCALLY:
    COMMAND
    ARG --required file_or_directory

    RUN --push \
        --secret OS_USERNAME \
        --secret OS_PASSWORD \
        --secret OS_AUTH_URL \
        --secret OS_AUTH_VERSION \
        --secret OS_TENANT_NAME \
        --secret OS_STORAGE_URL \
        --secret OS_CONTAINER_NAME \
        -- \
        cd $file_or_directory && \
            swift list $OS_CONTAINER_NAME | \
            perl -lne 'print if !-e' | \
            xargs --no-run-if-empty --verbose swift delete --object-threads 1 $OS_CONTAINER_NAME

        # The code above means:
        # - Get the list of files in the bucket
        # - Pipe them to a Perl one-liner to only keep files that don't exist locally. It reads like:
        #   "On every line, trim the line (-ln) and execute this code (-e): 'print $_ if file $_ does not (-e)xist'" (in perl, `$_` holds the current line and is implicit).
        # - Pipe the files-that-do-not-exist-locally list to `swift delete` via `xargs`
        #   NOTE: We use --object-threads 1 so that there is only one request made. Otherwise, swift will
        #   split all of the files into 10 threads (eg. for 50 files, it'll make 10 threads each bulk-deleting 5 files.)


# Run `swift list` on the container
swift-list:
    FROM +swift-deps

    RUN --push \
        --secret OS_USERNAME \
        --secret OS_PASSWORD \
        --secret OS_AUTH_URL \
        --secret OS_AUTH_VERSION \
        --secret OS_TENANT_NAME \
        --secret OS_STORAGE_URL \
        --secret OS_CONTAINER_NAME \
        -- \
        swift list $OS_CONTAINER_NAME


# Copy the site that was built in `+build`, then upload it via Swift and delete files in the container that aren't in the build result.
build-and-upload:
    FROM +swift-deps
    COPY +build/build_result ./to-sync

    DO +SWIFT_UPLOAD --file_or_directory=./to-sync
    DO +SWIFT_DELETE_BUCKET_FILES_NOT_PRESENT_LOCALLY --file_or_directory=./to-sync

# Upload a robots.txt file
upload-norobots:
    FROM +swift-deps

    RUN echo 'Disallow: /' >> robots.txt
    DO +SWIFT_UPLOAD --file_or_directory=./robots.txt


deploy-production:
    BUILD +build-and-upload

deploy-preview:
    BUILD +build-and-upload
    BUILD +upload-norobots


