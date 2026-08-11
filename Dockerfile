# Use nginx to serve static files
FROM nginx:stable-alpine

# clear default html served by nginx image
RUN rm -rf /usr/share/nginx/html/*

# copy project files into nginx html directory
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
